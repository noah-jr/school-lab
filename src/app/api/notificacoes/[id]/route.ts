import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    db.prepare("UPDATE notificacoes SET lida = 1 WHERE id = ? AND utilizador_id = ?").run(id, session.id);

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao atualizar notificação" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    db.prepare("DELETE FROM notificacoes WHERE id = ? AND utilizador_id = ?").run(id, session.id);

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao apagar notificação" }, { status: 500 });
  }
}
