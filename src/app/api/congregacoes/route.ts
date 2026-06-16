import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const congregacoes = db.prepare(`
      SELECT c.id, c.nome, ci.codigo AS circuito_codigo 
      FROM congregacoes c
      LEFT JOIN circuitos ci ON c.circuito_id = ci.id
      WHERE c.activo = 1
      ORDER BY c.nome ASC
    `).all();

    return NextResponse.json({ data: congregacoes });
  } catch (err) {
    console.error("[GET /api/congregacoes]", err);
    return NextResponse.json({ erro: "Erro ao carregar congregações" }, { status: 500 });
  }
}
