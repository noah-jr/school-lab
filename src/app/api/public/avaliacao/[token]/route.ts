import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

// Função para validar o token e retornar a turma
const validarToken = (db: any, token: string) => {
  const tokenData = db.prepare(`
    SELECT turma_id FROM tokens_avaliacao 
    WHERE token = ? AND revogado = 0 AND expira_em > datetime('now')
  `).get(token) as { turma_id: string } | undefined;

  if (!tokenData) throw new Error("Link expirado ou inválido.");
  return tokenData.turma_id;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const db = getDb();
    const { token } = await params;
    const turma_id = validarToken(db, token);

    const turma = db.prepare(`
      SELECT id, nome, numero_turma, local_nome, data_inicio, data_fim
      FROM turmas WHERE id = ?
    `).get(turma_id) as any;

    const estudantes = db.prepare(`
      SELECT te.id as turma_estudante_id, te.numero_lista, te.nivel_oratoria, te.avaliado_pelo_viajante,
             e.nome as estudante_nome, e.papel_ministerial, c.nome as congregacao_nome
      FROM turma_estudantes te
      JOIN estudantes e ON te.estudante_id = e.id
      LEFT JOIN congregacoes c ON e.congregacao_id = c.id
      WHERE te.turma_id = ?
      ORDER BY te.numero_lista ASC, e.nome ASC
    `).all(turma_id);

    return NextResponse.json({ data: { turma, estudantes } });
  } catch (err: any) {
    return NextResponse.json({ erro: err.message || "Erro interno" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const db = getDb();
    const { token } = await params;
    const turma_id = validarToken(db, token);

    const body = await req.json();
    const { turma_estudante_id, nivel } = body;

    // Garantir que este estudante pertence realmente a esta turma (segurança)
    const pertence = db.prepare(`
      SELECT id FROM turma_estudantes WHERE id = ? AND turma_id = ?
    `).get(turma_estudante_id, turma_id);

    if (!pertence) {
      return NextResponse.json({ erro: "Estudante não pertence a esta turma" }, { status: 403 });
    }

    db.prepare(`
      UPDATE turma_estudantes 
      SET nivel_oratoria = ?, avaliado_pelo_viajante = 1, data_avaliacao = datetime('now')
      WHERE id = ?
    `).run(nivel, turma_estudante_id);

    return NextResponse.json({ mensagem: "Avaliação guardada com sucesso!" });
  } catch (err: any) {
    return NextResponse.json({ erro: err.message || "Erro interno" }, { status: 401 });
  }
}
