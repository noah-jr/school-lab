import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pagina } = body;

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() 
      || req.headers.get("x-real-ip") 
      || "127.0.0.1";

    if (!pagina) {
      return NextResponse.json({ erro: "Página é obrigatória" }, { status: 400 });
    }

    const db = getDb();
    
    // Registar acesso público de internauta com IP
    db.prepare("INSERT INTO logs (acao, detalhe, severidade, ip_address) VALUES (?, ?, ?, ?)").run(
      "acesso_internauta",
      `Visita pública de internauta à página: ${pagina}`,
      "info",
      ipAddress
    );

    return NextResponse.json({ sucesso: true });
  } catch (err: any) {
    console.error("[POST /api/public/visita]", err);
    return NextResponse.json({ erro: "Erro ao registar log de visitante." }, { status: 500 });
  }
}
