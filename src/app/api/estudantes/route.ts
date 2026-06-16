import { NextRequest, NextResponse } from "next/server";
import { listarEstudantes, criarEstudante, estatisticasEstudantes } from "@/lib/repositories/estudantes";
import { getSession } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

// GET /api/estudantes
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const nome = searchParams.get("nome") ?? undefined;
    const congregacao_id = searchParams.get("congregacao_id") ?? undefined;
    const papel_ministerial = searchParams.get("papel_ministerial") ?? undefined;
    const turma_id = searchParams.get("turma_id") ?? undefined;
    const pagina = Number(searchParams.get("pagina") ?? "1");
    const porPagina = Number(searchParams.get("por_pagina") ?? "50");

    const { dados, total } = listarEstudantes({ nome, congregacao_id, papel_ministerial, turma_id, pagina, porPagina });
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
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    
    const body = await req.json();
    const estudante = criarEstudante(body, session.id);

    registarLog({
      acao: "Estudante Criado",
      detalhe: `Novo estudante "${estudante.nome}" adicionado ao sistema.`,
      severidade: "success",
      utilizadorId: session.id
    });

    return NextResponse.json({ data: estudante, mensagem: "Estudante criado" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/estudantes]", err);
    return NextResponse.json({ erro: "Erro ao criar estudante" }, { status: 500 });
  }
}
