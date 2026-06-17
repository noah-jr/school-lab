import getDb from "@/lib/db";
import { criarAuditLog, gerarId } from "@/lib/db/audit";
import type { Estudante, TurmaEstudante, CriarEstudanteInput } from "@/lib/types";
import crypto from "crypto";

// -------------------------------------------------------
// LISTAR ESTUDANTES
// -------------------------------------------------------
export function listarEstudantes(filtros?: {
  nome?: string;
  congregacao_id?: string;
  papel_ministerial?: string;
  turma_id?: string;
  pagina?: number;
  porPagina?: number;
}): { dados: Estudante[]; total: number } {
  const db = getDb();
  const pagina = filtros?.pagina ?? 1;
  const porPagina = filtros?.porPagina ?? 50;
  const offset = (pagina - 1) * porPagina;

  let where = "WHERE e.activo = 1";
  const params: unknown[] = [];

  let joinTurma = "";
  if (filtros?.turma_id && filtros.turma_id !== "todas") {
    joinTurma = "JOIN turma_estudantes te ON e.id = te.estudante_id";
    where += " AND te.turma_id = ?";
    params.push(filtros.turma_id);
  }

  if (filtros?.nome) {
    where += " AND e.nome LIKE ?";
    params.push(`%${filtros.nome}%`);
  }
  if (filtros?.congregacao_id && filtros.congregacao_id !== "todas") {
    where += " AND e.congregacao_id = ?";
    params.push(filtros.congregacao_id);
  }
  if (filtros?.papel_ministerial && filtros.papel_ministerial !== "todos") {
    where += " AND e.papel_ministerial = ?";
    params.push(filtros.papel_ministerial);
  }

  const total = (
    db.prepare(`SELECT COUNT(*) as c FROM estudantes e ${joinTurma} ${where}`).get(...params) as { c: number }
  ).c;

  const dados = db.prepare(`
    SELECT e.*, c.nome AS congregacao_nome, ci.codigo AS circuito_codigo
    FROM estudantes e
    ${joinTurma}
    LEFT JOIN congregacoes c ON e.congregacao_id = c.id
    LEFT JOIN circuitos ci ON c.circuito_id = ci.id
    ${where}
    ORDER BY e.nome ASC
    LIMIT ? OFFSET ?
  `).all(...params, porPagina, offset) as Estudante[];

  return { dados, total };
}

// -------------------------------------------------------
// OBTER ESTUDANTE POR ID
// -------------------------------------------------------
export function obterEstudante(id: string): Estudante | null {
  const db = getDb();
  const est = db.prepare(`
    SELECT e.*, c.nome AS congregacao_nome, ci.codigo AS circuito_codigo
    FROM estudantes e
    LEFT JOIN congregacoes c ON e.congregacao_id = c.id
    LEFT JOIN circuitos ci ON c.circuito_id = ci.id
    WHERE e.id = ?
  `).get(id) as Estudante | undefined;
  return est ?? null;
}

// -------------------------------------------------------
// CRIAR ESTUDANTE
// -------------------------------------------------------
export function criarEstudante(
  input: CriarEstudanteInput,
  utilizadorId?: string
): Estudante {
  const db = getDb();
  const id = gerarId();
  const agora = new Date().toISOString();

  const inserir = db.transaction(() => {
    db.prepare(`
      INSERT INTO estudantes (id, nome, email_jwpub, telefone_principal, telefone_alternativo,
        congregacao_id, papel_ministerial, fotografia, activo, criado_em, actualizado_em)
      VALUES (?,?,?,?,?,?,?,?,1,?,?)
    `).run(
      id, input.nome, input.email_jwpub ?? null,
      input.telefone_principal ?? null, input.telefone_alternativo ?? null,
      input.congregacao_id ?? null, input.papel_ministerial ?? "anciao",
      input.fotografia,
      agora, agora
    );

    criarAuditLog({ tabela: "estudantes", registoId: id, accao: "INSERT", dadosDepois: input, utilizadorId });
  });

  inserir();
  return obterEstudante(id)!;
}

// -------------------------------------------------------
// ACTUALIZAR ESTUDANTE
// -------------------------------------------------------
export function actualizarEstudante(
  id: string,
  input: Partial<CriarEstudanteInput>,
  utilizadorId?: string
): Estudante {
  const db = getDb();
  const antes = obterEstudante(id);
  const agora = new Date().toISOString();

  const COLUNAS_PERMITIDAS = [
    "nome", "email_jwpub", "telefone_principal", "telefone_alternativo",
    "congregacao_id", "papel_ministerial", "fotografia", "activo"
  ];
  const campos = Object.keys(input).filter(k => COLUNAS_PERMITIDAS.includes(k));
  if (campos.length === 0) return antes!;
  const set = campos.map((c) => `${c} = ?`).join(", ");
  const valores = campos.map((c) => (input as Record<string, unknown>)[c]);

  db.transaction(() => {
    db.prepare(`UPDATE estudantes SET ${set}, actualizado_em = ? WHERE id = ?`).run(...valores, agora, id);
    criarAuditLog({ tabela: "estudantes", registoId: id, accao: "UPDATE", dadosAntes: antes, dadosDepois: input, utilizadorId });
  })();

  return obterEstudante(id)!;
}

// -------------------------------------------------------
// ESTUDANTES DE UMA TURMA
// -------------------------------------------------------
export function listarEstudantesDaTurma(turmaId: string): TurmaEstudante[] {
  const db = getDb();
  return db.prepare(`
    SELECT te.*, e.nome AS estudante_nome, e.email_jwpub, e.telefone_principal,
      e.telefone_alternativo, e.papel_ministerial,
      c.nome AS congregacao_nome, ci.codigo AS circuito_codigo
    FROM turma_estudantes te
    JOIN estudantes e ON te.estudante_id = e.id
    LEFT JOIN congregacoes c ON e.congregacao_id = c.id
    LEFT JOIN circuitos ci ON c.circuito_id = ci.id
    WHERE te.turma_id = ?
    ORDER BY te.numero_lista ASC, e.nome ASC
  `).all(turmaId) as TurmaEstudante[];
}

// -------------------------------------------------------
// ADICIONAR ESTUDANTE À TURMA
// -------------------------------------------------------
export function adicionarEstudanteATurma(
  turmaId: string,
  estudanteId: string,
  dados: Partial<Omit<TurmaEstudante, "id" | "turma_id" | "estudante_id" | "criado_em" | "actualizado_em" | "token_acesso">>,
  utilizadorId?: string
): TurmaEstudante {
  const db = getDb();
  const id = gerarId();
  const agora = new Date().toISOString();
  const token = crypto.randomBytes(16).toString("hex");

  db.transaction(() => {
    db.prepare(`
      INSERT INTO turma_estudantes (id, turma_id, estudante_id, numero_lista, idade, anos_batismo,
        nivel_oratoria, cca_nome, cca_email, avaliado_pelo_viajante, observacoes, token_acesso, criado_em, actualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,0,?,?,?,?)
    `).run(
      id, turmaId, estudanteId,
      dados.numero_lista ?? null, dados.idade ?? null, dados.anos_batismo ?? null,
      dados.nivel_oratoria ?? null, dados.cca_nome ?? null, dados.cca_email ?? null,
      dados.observacoes ?? null, token, agora, agora
    );

    criarAuditLog({
      tabela: "turma_estudantes", registoId: id, accao: "INSERT",
      dadosDepois: { turmaId, estudanteId, token_acesso: token, ...dados }, utilizadorId,
    });
  })();

  return db.prepare("SELECT * FROM turma_estudantes WHERE id = ?").get(id) as TurmaEstudante;
}

// -------------------------------------------------------
// REGISTAR AVALIAÇÃO DO VIAJANTE
// -------------------------------------------------------
export function registarAvaliacaoViajante(
  turmaEstudanteId: string,
  nivel: string,
  utilizadorId?: string
): void {
  const db = getDb();
  const antes = db.prepare("SELECT * FROM turma_estudantes WHERE id = ?").get(turmaEstudanteId);
  const agora = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      UPDATE turma_estudantes
      SET nivel_oratoria = ?, avaliado_pelo_viajante = 1, data_avaliacao = ?, actualizado_em = ?
      WHERE id = ?
    `).run(nivel, agora, agora, turmaEstudanteId);

    criarAuditLog({
      tabela: "turma_estudantes", registoId: turmaEstudanteId, accao: "UPDATE",
      dadosAntes: antes, dadosDepois: { nivel_oratoria: nivel, avaliado_pelo_viajante: 1 },
      utilizadorId,
    });
  })();
}

// -------------------------------------------------------
// ESTATÍSTICAS GERAIS DE ESTUDANTES
// -------------------------------------------------------
export function estatisticasEstudantes(): {
  total: number;
  totalTurmas: number;
  mediaIdade: number;
  mediaBatismo: number;
} {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS c FROM estudantes WHERE activo=1").get() as { c: number }).c;
  const totalTurmas = (db.prepare("SELECT COUNT(DISTINCT turma_id) AS c FROM turma_estudantes").get() as { c: number }).c;
  const medias = db.prepare("SELECT AVG(idade) AS mi, AVG(anos_batismo) AS mb FROM turma_estudantes").get() as { mi: number; mb: number };

  return {
    total,
    totalTurmas,
    mediaIdade: Math.round((medias.mi ?? 0) * 10) / 10,
    mediaBatismo: Math.round((medias.mb ?? 0) * 10) / 10,
  };
}

// -------------------------------------------------------
// HISTÓRICO DE TURMAS DO ESTUDANTE
// -------------------------------------------------------
export function historicoEstudante(estudanteId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT te.*, t.nome as turma_nome, t.numero_turma, t.data_inicio, t.data_fim, t.status
    FROM turma_estudantes te
    JOIN turmas t ON te.turma_id = t.id
    WHERE te.estudante_id = ?
    ORDER BY t.data_inicio DESC
  `).all(estudanteId);
}

// -------------------------------------------------------
// OBTER ESTUDANTE VIA TOKEN PÚBLICO
// -------------------------------------------------------
export function obterTurmaEstudantePorToken(token: string) {
  const db = getDb();
  return db.prepare(`
    SELECT te.*, e.nome AS estudante_nome, e.congregacao_id, e.papel_ministerial, e.email_jwpub, e.telefone_principal, e.telefone_alternativo, e.fotografia,
           t.nome AS turma_nome, t.numero_turma,
           c.nome AS congregacao_nome, ci.codigo AS circuito_codigo
    FROM turma_estudantes te
    JOIN estudantes e ON te.estudante_id = e.id
    JOIN turmas t ON te.turma_id = t.id
    LEFT JOIN congregacoes c ON e.congregacao_id = c.id
    LEFT JOIN circuitos ci ON c.circuito_id = ci.id
    WHERE te.token_acesso = ?
  `).get(token) as any;
}

// -------------------------------------------------------
// GARANTIR TOKENS EXISTENTES (Para turmas antigas)
// -------------------------------------------------------
export function garantirTokensDaTurma(turmaId: string) {
  const db = getDb();
  const estudantesSemToken = db.prepare(`SELECT id FROM turma_estudantes WHERE turma_id = ? AND token_acesso IS NULL`).all(turmaId) as { id: string }[];

  if (estudantesSemToken.length > 0) {
    db.transaction(() => {
      const stmt = db.prepare(`UPDATE turma_estudantes SET token_acesso = ? WHERE id = ?`);
      for (const e of estudantesSemToken) {
        stmt.run(crypto.randomBytes(16).toString("hex"), e.id);
      }
    })();
  }
}

// -------------------------------------------------------
// APAGAR ESTUDANTE (SOFT DELETE)
// -------------------------------------------------------
export function apagarEstudante(id: string, utilizadorId?: string): boolean {
  const db = getDb();
  const antes = obterEstudante(id);
  if (!antes) return false;

  const agora = new Date().toISOString();

  const apagar = db.transaction(() => {
    db.prepare(`UPDATE estudantes SET activo = 0, actualizado_em = ? WHERE id = ?`)
      .run(agora, id);

    criarAuditLog({
      tabela: "estudantes", registoId: id, accao: "DELETE",
      dadosAntes: antes, dadosDepois: { activo: 0 }, utilizadorId,
    });
  });

  apagar();
  return true;
}
