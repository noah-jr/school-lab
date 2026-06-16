import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    
    let query = "SELECT * FROM mensagens WHERE destinatario_id = ? ORDER BY id DESC";
    let params = [session.id];

    // Se for administrador, vê as mensagens enviadas para si, e as mensagens globais (destinatario_id IS NULL, como feedbacks da landing page)
    if (session.papel === "admin") {
      query = "SELECT * FROM mensagens WHERE destinatario_id = ? OR destinatario_id IS NULL ORDER BY id DESC";
    }

    const mensagens = db.prepare(query).all(...params);
    return NextResponse.json({ data: mensagens });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao ler mensagens" }, { status: 500 });
  }
}
