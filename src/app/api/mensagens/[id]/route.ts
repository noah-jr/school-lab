import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { acao, assunto, conteudo } = body;
    const db = getDb();

    if (acao === "ocultar") {
      db.prepare("UPDATE mensagens SET ocultada = 1 WHERE id = ?").run(id);
    } else if (acao === "mostrar") {
      db.prepare("UPDATE mensagens SET ocultada = 0 WHERE id = ?").run(id);
    } else if (acao === "editar") {
      if (!assunto || !conteudo) {
        return NextResponse.json({ erro: "Assunto e conteúdo são obrigatórios para edição." }, { status: 400 });
      }
      db.prepare("UPDATE mensagens SET assunto = ?, conteudo = ? WHERE id = ?").run(assunto, conteudo, id);
    } else {
      // Padrão: marcar como lida
      db.prepare("UPDATE mensagens SET lida = 1 WHERE id = ?").run(id);
    }

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("[PATCH /api/mensagens/[id]]", err);
    return NextResponse.json({ erro: "Erro ao atualizar mensagem" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    db.prepare("DELETE FROM mensagens WHERE id = ?").run(id);

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("[DELETE /api/mensagens/[id]]", err);
    return NextResponse.json({ erro: "Erro ao eliminar mensagem" }, { status: 500 });
  }
}
