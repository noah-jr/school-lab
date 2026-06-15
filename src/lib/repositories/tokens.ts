import crypto from "crypto";
import getDb from "@/lib/db";
import { criarAuditLog, gerarId } from "@/lib/db/audit";

// -------------------------------------------------------
// TIPOS
// -------------------------------------------------------
export interface TokenAvaliacao {
  id: string;
  token: string;
  turma_id: string;
  descricao?: string;
  expira_em: string;
  revogado: number;
  criado_por?: string;
  criado_em: string;
}

export interface TokenComTurma extends TokenAvaliacao {
  turma_nome: string;
  turma_numero: number;
}

export interface EstudanteParaAvaliar {
  turma_estudante_id: string;
  estudante_id: string;
  nome: string;
  numero_lista?: number;
  congregacao_nome?: string;
  circuito_codigo?: string;
  papel_ministerial: string;
  idade?: number;
  anos_batismo?: number;
  nivel_oratoria?: string;
  avaliado_pelo_viajante: number;
  data_avaliacao?: string;
  observacoes?: string;
}

// -------------------------------------------------------
// CRIAR TOKEN
// -------------------------------------------------------
export function criarTokenAvaliacao(
  turmaId: string,
  descricao: string,
  diasValidade: number,
  utilizadorId?: string
): TokenAvaliacao {
  const db = getDb();
  const id = gerarId();
  const token = crypto.randomBytes(24).toString("hex"); // 48 chars hex
  const expiraEm = new Date(
    Date.now() + diasValidade * 24 * 60 * 60 * 1000
  ).toISOString();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO tokens_avaliacao (id, token, turma_id, descricao, expira_em, criado_por)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, token, turmaId, descricao || null, expiraEm, utilizadorId ?? null);

    criarAuditLog({
      tabela: "tokens_avaliacao",
      registoId: id,
      accao: "INSERT",
      dadosDepois: { turmaId, descricao, diasValidade },
      utilizadorId,
    });
  })();

  return db.prepare("SELECT * FROM tokens_avaliacao WHERE id = ?").get(id) as TokenAvaliacao;
}

// -------------------------------------------------------
// LISTAR TOKENS DE UMA TURMA
// -------------------------------------------------------
export function listarTokensDaTurma(turmaId: string): TokenAvaliacao[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT * FROM tokens_avaliacao
      WHERE turma_id = ?
      ORDER BY criado_em DESC
    `)
    .all(turmaId) as TokenAvaliacao[];
}

// -------------------------------------------------------
// REVOGAR TOKEN
// -------------------------------------------------------
export function revogarToken(id: string, utilizadorId?: string): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(`UPDATE tokens_avaliacao SET revogado = 1 WHERE id = ?`).run(id);
    criarAuditLog({
      tabela: "tokens_avaliacao",
      registoId: id,
      accao: "UPDATE",
      dadosDepois: { revogado: 1 },
      utilizadorId,
    });
  })();
}

// -------------------------------------------------------
// VALIDAR TOKEN (usado pela rota pública)
// Retorna o token com info da turma se válido, null caso contrário.
// -------------------------------------------------------
export function validarToken(token: string): TokenComTurma | null {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT ta.*, t.nome AS turma_nome, t.numero_turma AS turma_numero
      FROM tokens_avaliacao ta
      JOIN turmas t ON ta.turma_id = t.id
      WHERE ta.token = ?
        AND ta.revogado = 0
        AND ta.expira_em > datetime('now')
    `)
    .get(token) as TokenComTurma | undefined;

  return row ?? null;
}

// -------------------------------------------------------
// LISTAR ESTUDANTES PARA AVALIAR (via token público)
// -------------------------------------------------------
export function listarEstudantesParaAvaliar(turmaId: string): EstudanteParaAvaliar[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT
        te.id          AS turma_estudante_id,
        e.id           AS estudante_id,
        e.nome,
        te.numero_lista,
        c.nome         AS congregacao_nome,
        ci.codigo      AS circuito_codigo,
        e.papel_ministerial,
        te.idade,
        te.anos_batismo,
        te.nivel_oratoria,
        te.avaliado_pelo_viajante,
        te.data_avaliacao,
        te.observacoes
      FROM turma_estudantes te
      JOIN estudantes e ON te.estudante_id = e.id
      LEFT JOIN congregacoes c  ON e.congregacao_id = c.id
      LEFT JOIN circuitos ci    ON c.circuito_id = ci.id
      WHERE te.turma_id = ?
      ORDER BY te.numero_lista ASC, e.nome ASC
    `)
    .all(turmaId) as EstudanteParaAvaliar[];
}

// -------------------------------------------------------
// SUBMETER AVALIAÇÃO (via token público)
// -------------------------------------------------------
export function submeterAvaliacao(
  turmaEstudanteId: string,
  nivel: string | null,
  observacoes: string | null
): void {
  const db = getDb();
  const agora = new Date().toISOString();

  const antes = db
    .prepare("SELECT * FROM turma_estudantes WHERE id = ?")
    .get(turmaEstudanteId);

  db.transaction(() => {
    db.prepare(`
      UPDATE turma_estudantes
      SET nivel_oratoria         = ?,
          observacoes            = ?,
          avaliado_pelo_viajante = 1,
          data_avaliacao         = ?,
          actualizado_em         = ?
      WHERE id = ?
    `).run(nivel, observacoes ?? null, agora, agora, turmaEstudanteId);

    criarAuditLog({
      tabela: "turma_estudantes",
      registoId: turmaEstudanteId,
      accao: "UPDATE",
      dadosAntes: antes,
      dadosDepois: { nivel_oratoria: nivel, observacoes, avaliado_pelo_viajante: 1 },
    });
  })();
}
