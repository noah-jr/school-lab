import { NextRequest, NextResponse } from "next/server";
import { registarAvaliacaoViajante } from "@/lib/repositories/estudantes";

// PATCH /api/turmas/[id]/estudantes/[turmaEstudanteId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; turmaEstudanteId: string }> }
) {
  try {
    const { turmaEstudanteId } = await params;
    const { nivel_oratoria } = await req.json();

    registarAvaliacaoViajante(turmaEstudanteId, nivel_oratoria);

    return NextResponse.json({ mensagem: "Avaliação registada com sucesso" });
  } catch (err) {
    console.error("[PATCH /api/turmas/[id]/estudantes/[turmaEstudanteId]]", err);
    return NextResponse.json({ erro: "Erro ao registar avaliação" }, { status: 500 });
  }
}
