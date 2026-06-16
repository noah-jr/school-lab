import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import crypto from "crypto";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    // Obter user id para log
    const session = await getSession();
    const utilizadorId = session?.id || null;

    // Garantir que a tabela existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS tokens_avaliacao (
        id          TEXT PRIMARY KEY,
        token       TEXT NOT NULL UNIQUE,
        turma_id    TEXT NOT NULL REFERENCES turmas(id),
        descricao   TEXT,
        expira_em   TEXT NOT NULL,
        revogado    INTEGER NOT NULL DEFAULT 0,
        criado_por  TEXT REFERENCES utilizadores(id),
        criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_tokens_turma ON tokens_avaliacao(turma_id);
      CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens_avaliacao(token);
    `);

    // Verificar se já existe um token válido para esta turma
    const tokenExistente = db.prepare(`
      SELECT token FROM tokens_avaliacao 
      WHERE turma_id = ? AND revogado = 0 AND expira_em > datetime('now')
      ORDER BY criado_em DESC LIMIT 1
    `).get(id) as { token: string } | undefined;

    if (tokenExistente) {
      return NextResponse.json({ 
        token: tokenExistente.token, 
        mensagem: "Reutilizado token ativo existente" 
      });
    }

    // Gerar novo token seguro (expira em 30 dias)
    const tokenId = crypto.randomUUID();
    const token = crypto.randomBytes(16).toString("hex");
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 30); // Válido por 30 dias

    db.prepare(`
      INSERT INTO tokens_avaliacao (id, token, turma_id, descricao, expira_em, revogado, criado_por, criado_em)
      VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
    `).run(tokenId, token, id, "Acesso Viajante", expiraEm.toISOString(), utilizadorId);

    return NextResponse.json({ 
      token, 
      mensagem: "Novo link de avaliação gerado com sucesso!" 
    });

  } catch (err) {
    console.error("[POST /api/turmas/[id]/token-avaliacao]", err);
    return NextResponse.json({ erro: "Erro ao gerar token" }, { status: 500 });
  }
}
