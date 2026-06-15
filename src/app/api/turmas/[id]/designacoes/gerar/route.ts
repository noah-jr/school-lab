import { NextRequest, NextResponse } from "next/server";
import { gerarDesignacoes } from "@/lib/repositories/designacoes";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turmaId } = await params;
    const resultado = gerarDesignacoes(turmaId);

    return NextResponse.json({
      mensagem: `Designações geradas com sucesso! ${resultado.criadas} criadas, ${resultado.naoAtribuidas} não atribuídas.`,
      data: resultado
    }, { status: 200 });
  } catch (err: any) {
    console.error("[POST /api/turmas/[id]/designacoes/gerar]", err);
    return NextResponse.json({ erro: err?.message || "Erro ao gerar designações." }, { status: 500 });
  }
}
