import { NextResponse } from "next/server";
import { listarProgramas, listarPartes } from "@/lib/repositories/programas";
import { runMigrations } from "@/lib/db";

let migrado = false;
function garantirMigracoes() {
  if (!migrado) { runMigrations(); migrado = true; }
}

export async function GET(req: Request) {
  try {
    garantirMigracoes();
    const url = new URL(req.url);
    const partesId = url.searchParams.get("programa_id");
    
    if (partesId) {
       const data = listarPartes(partesId);
       return NextResponse.json({ data });
    }
    
    const data = listarProgramas();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[GET /api/programas]", err);
    return NextResponse.json({ erro: "Erro ao listar programas" }, { status: 500 });
  }
}
