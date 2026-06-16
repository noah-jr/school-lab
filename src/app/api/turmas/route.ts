import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listarTurmas, criarTurma, estatisticasTurmas } from "@/lib/repositories/turmas";
import { registarLog } from "@/lib/logger";

// GET /api/turmas
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const pagina = Number(searchParams.get("pagina") ?? "1");
    const porPagina = Number(searchParams.get("por_pagina") ?? "20");

    const { dados, total } = listarTurmas({ status, pagina, porPagina });
    const stats = estatisticasTurmas();

    return NextResponse.json({
      data: dados,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
      stats,
    });
  } catch (err) {
    console.error("[GET /api/turmas]", err);
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST /api/turmas
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    
    const body = await req.json();
    const turma = criarTurma(body);

    registarLog({
      acao: "Turma Criada",
      detalhe: `Nova turma "${turma.nome || `${turma.numero_turma}\u00aa Turma`}" criada no sistema.`,
      severidade: "success",
      utilizadorId: session.id
    });

    return NextResponse.json({ data: turma, mensagem: "Turma criada com sucesso" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/turmas]", err);
    return NextResponse.json({ erro: "Erro ao criar turma" }, { status: 500 });
  }
}
