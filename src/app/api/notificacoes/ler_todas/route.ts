import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    db.prepare("UPDATE notificacoes SET lida = 1 WHERE utilizador_id = ?").run(session.id);

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao marcar notificações como lidas" }, { status: 500 });
  }
}
