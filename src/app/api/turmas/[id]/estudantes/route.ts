import { NextRequest, NextResponse } from "next/server";
import { listarEstudantesDaTurma, adicionarEstudanteATurma, garantirTokensDaTurma } from "@/lib/repositories/estudantes";
import { gerarDesignacoes } from "@/lib/repositories/designacoes";

// GET /api/turmas/[id]/estudantes
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    garantirTokensDaTurma(id);
    const estudantes = listarEstudantesDaTurma(id);
    return NextResponse.json({ data: estudantes, total: estudantes.length });
  } catch (err) {
    console.error("[GET /api/turmas/[id]/estudantes]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}

// POST /api/turmas/[id]/estudantes
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { estudante_id, ...dados } = body;
    const resultado = adicionarEstudanteATurma(id, estudante_id, dados);
    return NextResponse.json({ data: resultado, mensagem: "Estudante adicionado à turma" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/turmas/[id]/estudantes]", err);
    return NextResponse.json({ erro: "Erro ao adicionar estudante" }, { status: 500 });
  }
}
