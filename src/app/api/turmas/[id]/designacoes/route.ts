import { NextRequest, NextResponse } from "next/server";
import { listarDesignacoesDaTurma, gerarDesignacoes, atribuirDesignacao } from "@/lib/repositories/designacoes";
import getDb from "@/lib/db";

// GET /api/turmas/[id]/designacoes
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const designacoes = listarDesignacoesDaTurma(id);
    return NextResponse.json({ data: designacoes, total: designacoes.length });
  } catch (err) {
    console.error("[GET /api/turmas/[id]/designacoes]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}


// PUT /api/turmas/[id]/designacoes
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { turma_estudante_id, parte_id, dia_semana } = body;

    if (!turma_estudante_id || !parte_id || !dia_semana) {
      return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
    }

    const db = getDb();
    
    // Primeiro remover qualquer designação existente para esta parte nesta turma
    db.prepare(`DELETE FROM designacoes WHERE turma_id = ? AND parte_id = ?`).run(id, parte_id);

    // Atribuir o novo estudante
    const resultado = atribuirDesignacao(id, turma_estudante_id, parte_id, dia_semana);
    
    return NextResponse.json({ data: resultado, mensagem: "Designação atualizada" });
  } catch (err) {
    console.error("[PUT /api/turmas/[id]/designacoes]", err);
    return NextResponse.json({ erro: "Erro ao atualizar designação" }, { status: 500 });
  }
}
