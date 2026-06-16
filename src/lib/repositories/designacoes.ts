import getDb from "@/lib/db";
import { criarAuditLog, gerarId } from "@/lib/db/audit";
import type { Designacao, NivelOratoria } from "@/lib/types";

// Mapa de compatibilidade: nível do estudante → níveis que pode receber
const COMPATIBILIDADE: Record<string, string[]> = {
  "A+": ["A", "A/B", "B/C", "A/B/C", "B", "C"],
  "A":  ["A", "A/B", "B/C", "A/B/C", "B", "C"],
  "A-": ["A", "A/B", "B/C", "A/B/C", "B", "C"],
  "B+": ["A/B", "B/C", "A/B/C", "B", "C"],
  "B":  ["A/B", "B/C", "A/B/C", "B", "C"],
  "B-": ["B/C", "A/B/C", "B", "C"],
  "C+": ["B/C", "A/B/C", "C"],
  "C":  ["B/C", "A/B/C", "C"],
  "C-": ["C"],
};

// -------------------------------------------------------
// LISTAR DESIGNAÇÕES DE UMA TURMA
// -------------------------------------------------------
export function listarDesignacoesDaTurma(turmaId: string): Designacao[] {
  const db = getDb();
  // Primeiro obtemos o ID do programa da turma
  const turma = db.prepare("SELECT programa_id FROM turmas WHERE id = ?").get(turmaId) as { programa_id: string } | undefined;
  if (!turma?.programa_id) return [];

  return db.prepare(`
    SELECT 
      d.id as designacao_id, d.status, d.criado_em, d.actualizado_em,
      pp.id as parte_id, pp.numero, pp.titulo, pp.tipo, pp.nivel_requerido, pp.dia_semana,
      pp.hora_inicio, pp.duracao_minutos,
      e.nome AS estudante_nome, te.nivel_oratoria, te.id as turma_estudante_id
    FROM programa_partes pp
    LEFT JOIN designacoes d ON pp.id = d.parte_id AND d.turma_id = ?
    LEFT JOIN turma_estudantes te ON d.turma_estudante_id = te.id
    LEFT JOIN estudantes e ON te.estudante_id = e.id
    WHERE pp.programa_id = ? AND pp.nivel_requerido != 'NULO'
    ORDER BY pp.ordem ASC
  `).all(turmaId, turma.programa_id) as Designacao[];
}

// -------------------------------------------------------
// GERAR DESIGNAÇÕES AUTOMATICAMENTE
// -------------------------------------------------------
export function gerarDesignacoes(turmaId: string, utilizadorId?: string): {
  criadas: number;
  naoAtribuidas: number;
} {
  const db = getDb();

  // Limpar designações pendentes existentes desta turma
  db.prepare(`DELETE FROM designacoes WHERE turma_id = ? AND status = 'pendente'`).run(turmaId);

  // Obter partes do programa da turma (excluir NULO)
  const turma = db.prepare("SELECT programa_id FROM turmas WHERE id = ?").get(turmaId) as { programa_id: string } | undefined;
  if (!turma?.programa_id) throw new Error("Turma sem programa associado");

  const partes = db.prepare(`
    SELECT * FROM programa_partes WHERE programa_id = ? AND nivel_requerido != 'NULO' ORDER BY ordem ASC
  `).all(turma.programa_id) as Array<{ id: string; nivel_requerido: string; dia_semana: string; numero: number; tipo: string }>;

  // Obter estudantes avaliados com congregação e circuito
  const estudantes = db.prepare(`
    SELECT te.id, te.nivel_oratoria, e.congregacao_id, c.circuito_id
    FROM turma_estudantes te
    JOIN estudantes e ON te.estudante_id = e.id
    LEFT JOIN congregacoes c ON e.congregacao_id = c.id
    WHERE te.turma_id = ? AND te.nivel_oratoria IS NOT NULL
    ORDER BY RANDOM()
  `).all(turmaId) as Array<{ id: string; nivel_oratoria: NivelOratoria; congregacao_id: string; circuito_id: string }>;

  if (estudantes.length === 0) {
    return { criadas: 0, naoAtribuidas: partes.length };
  }

  const agora = new Date().toISOString();
  let criadas = 0;
  let naoAtribuidas = 0;

  // Mapas para rastrear carga
  const desigGlobais = new Map<string, number>(); // Conta total de partes do estudante
  const desigPorDia = new Map<string, Set<string>>(); // Evita 2 partes no mesmo dia
  estudantes.forEach((e) => {
    desigGlobais.set(e.id, 0);
    desigPorDia.set(e.id, new Set());
  });

  const inserirDesig = db.prepare(`
    INSERT INTO designacoes (id, turma_id, turma_estudante_id, parte_id, dia_semana, status, criado_em, actualizado_em)
    VALUES (?,?,?,?,?,?,?,?)
  `);

  // Agrupar partes pelo número (para processar partes de grupo juntas)
  const partesAgrupadas: Record<number, typeof partes> = {};
  for (const p of partes) {
    if (!partesAgrupadas[p.numero]) partesAgrupadas[p.numero] = [];
    partesAgrupadas[p.numero].push(p);
  }

  const transaccao = db.transaction(() => {
    for (const numStr of Object.keys(partesAgrupadas)) {
      const grupoPartes = partesAgrupadas[Number(numStr)];
      const dia = grupoPartes[0].dia_semana;
      
      // Encontrar uma combinação de estudantes (1 por subparte)
      const comboLocal: string[] = [];
      let congreBase: string | null = null;
      let circuitoBase: string | null = null;
      let falhou = false;

      for (const p of grupoPartes) {
        // Filtrar estudantes compatíveis
        const compativeis = estudantes.filter(est => {
          if (comboLocal.includes(est.id)) return false; // Já está no combo
          if (desigPorDia.get(est.id)?.has(dia)) return false; // Já tem parte neste dia
          const niveisPermitidos = COMPATIBILIDADE[est.nivel_oratoria] ?? [];
          return niveisPermitidos.includes(p.nivel_requerido);
        });

        if (compativeis.length === 0) {
          falhou = true;
          break;
        }

        // Ordenar os compatíveis por:
        // 1. Quem tem menos designações globais (Garante que TODOS participam)
        // 2. Se for grupo, quem é da mesma congregação (Prioridade Forte)
        // 3. Se for grupo, quem é do mesmo circuito / "congregação vizinha" (Prioridade Secundária)
        compativeis.sort((a, b) => {
          const scoreA = (desigGlobais.get(a.id) ?? 0) * 100 
                         - (congreBase === a.congregacao_id ? 50 : 0)
                         - (circuitoBase && circuitoBase === a.circuito_id && congreBase !== a.congregacao_id ? 20 : 0);
          
          const scoreB = (desigGlobais.get(b.id) ?? 0) * 100 
                         - (congreBase === b.congregacao_id ? 50 : 0)
                         - (circuitoBase && circuitoBase === b.circuito_id && congreBase !== b.congregacao_id ? 20 : 0);
                         
          return scoreA - scoreB;
        });

        const escolhido = compativeis[0];
        comboLocal.push(escolhido.id);
        if (!congreBase) {
          congreBase = escolhido.congregacao_id;
          circuitoBase = escolhido.circuito_id;
        }
      }

      if (falhou) {
        naoAtribuidas += grupoPartes.length;
      } else {
        // Sucesso: registrar e gravar
        for (let i = 0; i < grupoPartes.length; i++) {
          const p = grupoPartes[i];
          const estId = comboLocal[i];
          
          const id = gerarId();
          inserirDesig.run(id, turmaId, estId, p.id, p.dia_semana, "pendente", agora, agora);
          
          desigPorDia.get(estId)!.add(p.dia_semana);
          desigGlobais.set(estId, (desigGlobais.get(estId) || 0) + 1);
          criadas++;
        }
      }
    }

    criarAuditLog({
      tabela: "designacoes", registoId: turmaId, accao: "INSERT",
      dadosDepois: { criadas, naoAtribuidas, turmaId }, utilizadorId,
    });
  });

  transaccao();
  return { criadas, naoAtribuidas };
}

// -------------------------------------------------------
// ATRIBUIR DESIGNAÇÃO MANUAL
// -------------------------------------------------------
export function atribuirDesignacao(
  turmaId: string,
  turmaEstudanteId: string,
  parteId: string,
  diaSemana: string,
  utilizadorId?: string
): Designacao {
  const db = getDb();
  const id = gerarId();
  const agora = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO designacoes (id, turma_id, turma_estudante_id, parte_id, dia_semana, status, criado_em, actualizado_em)
      VALUES (?,?,?,?,?,'pendente',?,?)
    `).run(id, turmaId, turmaEstudanteId, parteId, diaSemana, agora, agora);

    criarAuditLog({ tabela: "designacoes", registoId: id, accao: "INSERT",
      dadosDepois: { turmaId, turmaEstudanteId, parteId, diaSemana }, utilizadorId });
  })();

  return db.prepare("SELECT * FROM designacoes WHERE id = ?").get(id) as Designacao;
}

// -------------------------------------------------------
// LISTAR DESIGNAÇÕES DO ESTUDANTE (Portal Público)
// -------------------------------------------------------
export function listarDesignacoesDoEstudante(turmaEstudanteId: string): Designacao[] {
  const db = getDb();
  return db.prepare(`
    SELECT d.id as designacao_id, d.status, d.criado_em, d.actualizado_em, d.motivo_recusa,
           pp.id as parte_id, pp.numero, pp.titulo, pp.tipo, pp.nivel_requerido, pp.dia_semana,
           pp.hora_inicio, pp.duracao_minutos
    FROM designacoes d
    JOIN programa_partes pp ON d.parte_id = pp.id
    WHERE d.turma_estudante_id = ?
    ORDER BY pp.ordem ASC
  `).all(turmaEstudanteId) as Designacao[];
}

// -------------------------------------------------------
// CONFIRMAR DESIGNAÇÃO
// -------------------------------------------------------
export function confirmarDesignacao(designacaoId: string): void {
  const db = getDb();
  const agora = new Date().toISOString();
  
  db.transaction(() => {
    const antes = db.prepare("SELECT * FROM designacoes WHERE id = ?").get(designacaoId);
    if (!antes) return;
    
    db.prepare(`UPDATE designacoes SET status = 'confirmada', actualizado_em = ? WHERE id = ?`)
      .run(agora, designacaoId);
      
    criarAuditLog({
      tabela: "designacoes",
      registoId: designacaoId,
      accao: "UPDATE",
      dadosAntes: antes,
      dadosDepois: { status: "confirmada" }
    });
  })();
}

// -------------------------------------------------------
// RECUSAR DESIGNAÇÃO
// -------------------------------------------------------
export function recusarDesignacao(designacaoId: string, motivo: string): void {
  const db = getDb();
  const agora = new Date().toISOString();
  
  db.transaction(() => {
    const antes = db.prepare("SELECT * FROM designacoes WHERE id = ?").get(designacaoId);
    if (!antes) return;
    
    db.prepare(`UPDATE designacoes SET status = 'cancelada', motivo_recusa = ?, actualizado_em = ? WHERE id = ?`)
      .run(motivo, agora, designacaoId);
      
    criarAuditLog({
      tabela: "designacoes",
      registoId: designacaoId,
      accao: "UPDATE",
      dadosAntes: antes,
      dadosDepois: { status: "cancelada", motivo_recusa: motivo }
    });
  })();
}
