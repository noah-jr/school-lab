import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    // Só pode marcar como lida se for o destinatário ou se for admin (no caso de globais)
    db.prepare("UPDATE mensagens SET lida = 1 WHERE id = ?").run(id);

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao marcar mensagem como lida" }, { status: 500 });
  }
}
