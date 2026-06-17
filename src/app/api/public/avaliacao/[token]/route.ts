import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { criarAuditLog } from "@/lib/db/audit";

// Função para validar o token e retornar a turma
const validarToken = (db: any, token: string) => {
  const tokenData = db.prepare(`
    SELECT t.id, t.nome, t.numero_turma, ta.descricao as viajante_nome
    FROM tokens_avaliacao ta
    JOIN turmas t ON ta.turma_id = t.id
    WHERE ta.token = ? AND ta.revogado = 0 AND ta.expira_em > datetime('now')
  `).get(token) as { id: string; nome: string; numero_turma: number; viajante_nome?: string } | undefined;

  if (!tokenData) throw new Error("Link expirado ou inválido.");
  return tokenData;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const db = getDb();
    const { token } = await params;
    const tokenData = validarToken(db, token);
    const turma_id = tokenData.id;

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || req.headers.get("x-real-ip")
      || "127.0.0.1";
    db.prepare("INSERT INTO logs (acao, detalhe, severidade, ip_address) VALUES (?, ?, ?, ?)").run(
      "acesso_portal_viajante",
      `Acesso ao portal de avaliação pelo Viajante ${tokenData.viajante_nome || "Desconhecido"} na turma ${tokenData.nome || tokenData.numero_turma}`,
      "info",
      ipAddress
    );

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
    const tokenData = validarToken(db, token);
    const turma_id = tokenData.id;

    const body = await req.json();
    const { turma_estudante_id, nivel } = body;

    // Garantir que este estudante pertence realmente a esta turma (segurança) e obter estado anterior
    const antes = db.prepare(`
      SELECT te.*, e.nome as estudante_nome 
      FROM turma_estudantes te
      JOIN estudantes e ON te.estudante_id = e.id
      WHERE te.id = ? AND te.turma_id = ?
    `).get(turma_estudante_id, turma_id) as any;

    if (!antes) {
      return NextResponse.json({ erro: "Estudante não pertence a esta turma" }, { status: 403 });
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || req.headers.get("x-real-ip")
      || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    db.transaction(() => {
      db.prepare(`
        UPDATE turma_estudantes 
        SET nivel_oratoria = ?, avaliado_pelo_viajante = 1, data_avaliacao = datetime('now'), actualizado_em = datetime('now')
        WHERE id = ?
      `).run(nivel, turma_estudante_id);

      // Registo de auditoria refinado
      criarAuditLog({
        tabela: "turma_estudantes",
        registoId: turma_estudante_id,
        accao: "UPDATE",
        dadosAntes: {
          nivel_oratoria: antes.nivel_oratoria,
          avaliado_pelo_viajante: antes.avaliado_pelo_viajante,
          data_avaliacao: antes.data_avaliacao,
        },
        dadosDepois: {
          nivel_oratoria: nivel,
          avaliado_pelo_viajante: 1,
        },
        ipAddress,
        userAgent
      });

      // Registo no log geral do sistema
      db.prepare(`
        INSERT INTO logs (acao, detalhe, severidade)
        VALUES (?, ?, ?)
      `).run(
        "Avaliacao Viajante",
        `Viajante (${tokenData.viajante_nome || "Link Público"}) alterou a nota de ${antes.estudante_nome} de [${antes.nivel_oratoria || "Sem Nota"}] para [${nivel}] na turma ${tokenData.numero_turma}ª - ${tokenData.nome}.`,
        "info"
      );
    })();

    return NextResponse.json({ mensagem: "Avaliação guardada com sucesso!" });
  } catch (err: any) {
    console.error("[PATCH /api/public/avaliacao]", err);
    return NextResponse.json({ erro: err.message || "Erro interno" }, { status: 401 });
  }
}
