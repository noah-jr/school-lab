import { NextRequest, NextResponse } from "next/server";
import { obterTurma, actualizarTurma, apagarTurma } from "@/lib/repositories/turmas";
import { getSession } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

// GET /api/turmas/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const turma = obterTurma(id);
    if (!turma) return NextResponse.json({ erro: "Turma não encontrada" }, { status: 404 });
    return NextResponse.json({ data: turma });
  } catch (err) {
    console.error("[GET /api/turmas/[id]]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}

// PATCH /api/turmas/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;

    const CAMPOS_PERMITIDOS = [
      "numero_turma", "nome", "local_nome", "local_cidade", "pais",
      "data_inicio", "data_fim", "instrutor_a_nome", "instrutor_b_nome",
      "programa_id", "status", "observacoes",
    ];

    const body = await req.json();
    const input: Record<string, unknown> = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (campo in body) input[campo] = body[campo];
    }

    const turma = actualizarTurma(id, input);

    registarLog({
      acao: "Turma Atualizada",
      detalhe: `Turma "${turma.nome || `#${turma.numero_turma}`}" (ID: ${id}) foi atualizada.`,
      severidade: "info",
      utilizadorId: session?.id
    });

    return NextResponse.json({ data: turma, mensagem: "Turma actualizada" });
  } catch (err) {
    console.error("[PATCH /api/turmas/[id]]", err);
    return NextResponse.json({ erro: "Erro ao atualizar turma" }, { status: 500 });
  }
}

// DELETE /api/turmas/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const antes = obterTurma(id);
    const sucesso = apagarTurma(id);
    if (!sucesso) return NextResponse.json({ erro: "Turma não encontrada" }, { status: 404 });

    registarLog({
      acao: "Turma Cancelada",
      detalhe: `Turma "${antes?.nome || `#${antes?.numero_turma}`}" (ID: ${id}) foi cancelada.`,
      severidade: "warning",
      utilizadorId: session?.id
    });

    return NextResponse.json({ mensagem: "Turma cancelada com sucesso" });
  } catch (err) {
    console.error("[DELETE /api/turmas/[id]]", err);
    return NextResponse.json({ erro: "Erro interno ao apagar turma" }, { status: 500 });
  }
}

