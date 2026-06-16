import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();
    
    const utilizador = db.prepare("SELECT nome, email FROM utilizadores WHERE id = ?").get(id) as any;
    if (!utilizador) {
      return NextResponse.json({ erro: "Utilizador não encontrado" }, { status: 404 });
    }

    const senhaPadrao = "12345678";
    const agora = new Date().toISOString();

    db.prepare("UPDATE utilizadores SET senha_hash = ?, actualizado_em = ?, precisa_mudar_senha = 1 WHERE id = ?").run(
      hashPassword(senhaPadrao), agora, id
    );

    registarLog({
      acao: "Senha Reposta",
      detalhe: `Administrador repôs a senha do utilizador "${utilizador.nome}" para a padrão.`,
      severidade: "warning",
      utilizadorId: session.id
    });

    return NextResponse.json({ mensagem: "Senha reposta com sucesso para o valor padrão." });
  } catch (err) {
    console.error("[PATCH /api/utilizadores/[id]/reset-senha]", err);
    return NextResponse.json({ erro: "Erro ao repor a senha" }, { status: 500 });
  }
}
