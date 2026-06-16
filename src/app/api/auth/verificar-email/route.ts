import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ erro: "Email é obrigatório" }, { status: 400 });
    }

    const db = getDb();
    const utilizador = db.prepare("SELECT id FROM utilizadores WHERE email = ? AND activo = 1").get(email);

    return NextResponse.json({ existe: !!utilizador });
  } catch (err) {
    console.error("[POST /api/auth/verificar-email]", err);
    return NextResponse.json({ erro: "Erro ao verificar email" }, { status: 500 });
  }
}
