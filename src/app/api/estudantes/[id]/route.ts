import { NextRequest, NextResponse } from "next/server";
import { obterEstudante, historicoEstudante, actualizarEstudante } from "@/lib/repositories/estudantes";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estudante = obterEstudante(id);
    if (!estudante) {
      return NextResponse.json({ erro: "Estudante não encontrado" }, { status: 404 });
    }

    const historico = historicoEstudante(id);

    return NextResponse.json({ data: { ...estudante, historico } });
  } catch (err) {
    console.error("[GET /api/estudantes/[id]]", err);
    return NextResponse.json({ erro: "Erro ao carregar estudante" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const CAMPOS_PERMITIDOS = [
      "nome", "email_jwpub", "telefone_principal", "telefone_alternativo",
      "congregacao_id", "papel_ministerial",
    ];

    const body = await req.json();
    const input: Record<string, unknown> = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (campo in body) input[campo] = body[campo];
    }

    const estudante = actualizarEstudante(id, input);
    return NextResponse.json({ data: estudante, mensagem: "Estudante atualizado com sucesso" });
  } catch (err) {
    console.error("[PATCH /api/estudantes/[id]]", err);
    return NextResponse.json({ erro: "Erro ao atualizar estudante" }, { status: 500 });
  }
}
