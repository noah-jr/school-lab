import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    const notificacoes = db.prepare("SELECT * FROM notificacoes WHERE utilizador_id = ? ORDER BY id DESC LIMIT 50").all(session.id);
    
    return NextResponse.json({ data: notificacoes });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao ler notificações" }, { status: 500 });
  }
}
