import getDb from "@/lib/db";
import { criarAuditLog, gerarId } from "@/lib/db/audit";
import type { Turma, CriarTurmaInput } from "@/lib/types";

// -------------------------------------------------------
// LISTAR TURMAS
// -------------------------------------------------------
export function listarTurmas(filtros?: {
  status?: string;
  pagina?: number;
  porPagina?: number;
}): { dados: Turma[]; total: number } {
  const db = getDb();
  const pagina = filtros?.pagina ?? 1;
  const porPagina = filtros?.porPagina ?? 20;
  const offset = (pagina - 1) * porPagina;

  let where = "WHERE 1=1";
  const params: unknown[] = [];

  if (filtros?.status) {
    where += " AND t.status = ?";
    params.push(filtros.status);
  }

  const total = (
    db
      .prepare(`SELECT COUNT(*) as c FROM turmas t ${where}`)
      .get(...params) as { c: number }
  ).c;

  const dados = db
    .prepare(
      `SELECT t.*,
        (SELECT COUNT(*) FROM turma_estudantes te WHERE te.turma_id = t.id) AS total_estudantes,
        (SELECT COUNT(*) FROM turma_estudantes te WHERE te.turma_id = t.id AND te.avaliado_pelo_viajante = 1) AS total_avaliados
      FROM turmas t
      ${where}
      ORDER BY t.numero_turma DESC
      LIMIT ? OFFSET ?`
    )
    .all(...params, porPagina, offset) as Turma[];

  return { dados, total };
}

// -------------------------------------------------------
// OBTER TURMA POR ID
// -------------------------------------------------------
export function obterTurma(id: string): Turma | null {
  const db = getDb();
  const turma = db
    .prepare(
      `SELECT t.*,
        (SELECT COUNT(*) FROM turma_estudantes te WHERE te.turma_id = t.id) AS total_estudantes,
        (SELECT COUNT(*) FROM turma_estudantes te WHERE te.turma_id = t.id AND te.avaliado_pelo_viajante = 1) AS total_avaliados
      FROM turmas t WHERE t.id = ?`
    )
    .get(id) as Turma | undefined;

  return turma ?? null;
}

// -------------------------------------------------------
// CRIAR TURMA
// -------------------------------------------------------
export function criarTurma(
  input: CriarTurmaInput,
  utilizadorId?: string
): Turma {
  const db = getDb();
  const id = gerarId();
  const agora = new Date().toISOString();

  const inserir = db.transaction(() => {
    db.prepare(`
      INSERT INTO turmas (id, numero_turma, nome, local_nome, local_cidade, pais, data_inicio, data_fim,
        instrutor_a_nome, instrutor_b_nome, programa_id, status, observacoes, criado_por, criado_em, actualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, input.numero_turma, input.nome, input.local_nome,
      input.local_cidade ?? null, input.pais, input.data_inicio, input.data_fim,
      input.instrutor_a_nome ?? null, input.instrutor_b_nome ?? null,
      input.programa_id ?? 'prog-eac-standard', input.status ?? "rascunho",
      input.observacoes ?? null, utilizadorId ?? null, agora, agora
    );

    criarAuditLog({
      tabela: "turmas", registoId: id, accao: "INSERT",
      dadosDepois: input, utilizadorId,
    });
  });

  inserir();
  return obterTurma(id)!;
}

// -------------------------------------------------------
// ACTUALIZAR TURMA
// -------------------------------------------------------
export function actualizarTurma(
  id: string,
  input: Partial<CriarTurmaInput>,
  utilizadorId?: string
): Turma {
  const db = getDb();
  const antes = obterTurma(id);
  const agora = new Date().toISOString();

  const COLUNAS_PERMITIDAS = [
    "numero_turma", "nome", "local_nome", "local_cidade", "pais",
    "data_inicio", "data_fim", "instrutor_a_nome", "instrutor_b_nome",
    "programa_id", "status", "observacoes"
  ];
  const campos = Object.keys(input).filter((k) => k !== "id" && COLUNAS_PERMITIDAS.includes(k));
  if (campos.length === 0) return antes!;

  const set = campos.map((c) => `${c} = ?`).join(", ");
  const valores = campos.map((c) => (input as Record<string, unknown>)[c]);

  const actualizar = db.transaction(() => {
    db.prepare(`UPDATE turmas SET ${set}, actualizado_em = ? WHERE id = ?`)
      .run(...valores, agora, id);

    criarAuditLog({
      tabela: "turmas", registoId: id, accao: "UPDATE",
      dadosAntes: antes, dadosDepois: input, utilizadorId,
    });
  });

  actualizar();
  return obterTurma(id)!;
}

// -------------------------------------------------------
// ESTATÍSTICAS DO DASHBOARD
// -------------------------------------------------------
export function estatisticasTurmas(): {
  total: number;
  activas: number;
  concluidas: number;
  rascunhos: number;
} {
  const db = getDb();
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'activa' THEN 1 ELSE 0 END) AS activas,
      SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
      SUM(CASE WHEN status = 'rascunho' THEN 1 ELSE 0 END) AS rascunhos
    FROM turmas
  `).get() as { total: number; activas: number; concluidas: number; rascunhos: number };
  return row;
}
