import { NextRequest, NextResponse } from "next/server";
import { listarEstudantes, criarEstudante, estatisticasEstudantes } from "@/lib/repositories/estudantes";
import { runMigrations } from "@/lib/db";

let migrado = false;
function garantirMigracoes() {
  if (!migrado) { runMigrations(); migrado = true; }
}

// GET /api/estudantes
export async function GET(req: NextRequest) {
  try {
    garantirMigracoes();
    const { searchParams } = new URL(req.url);
    const nome = searchParams.get("nome") ?? undefined;
    const congregacao_id = searchParams.get("congregacao_id") ?? undefined;
    const pagina = Number(searchParams.get("pagina") ?? "1");
    const porPagina = Number(searchParams.get("por_pagina") ?? "50");

    const { dados, total } = listarEstudantes({ nome, congregacao_id, pagina, porPagina });
    const stats = estatisticasEstudantes();

    return NextResponse.json({
      data: dados,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
      stats,
    });
  } catch (err) {
    console.error("[GET /api/estudantes]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}

// POST /api/estudantes
export async function POST(req: NextRequest) {
  try {
    garantirMigracoes();
    const body = await req.json();
    const estudante = criarEstudante(body);
    return NextResponse.json({ data: estudante, mensagem: "Estudante criado" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/estudantes]", err);
    return NextResponse.json({ erro: "Erro ao criar estudante" }, { status: 500 });
  }
}
