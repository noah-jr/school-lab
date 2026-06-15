import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runMigrations } from "@/lib/db";
import {
  criarTokenAvaliacao,
  listarTokensDaTurma,
  revogarToken,
} from "@/lib/repositories/tokens";

// -------------------------------------------------------
// GET /api/turmas/[id]/tokens
// Lista todos os tokens de acesso para viajante desta turma
// -------------------------------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    runMigrations();
    const { id } = await params;
    const tokens = listarTokensDaTurma(id);

    return NextResponse.json({ data: tokens });
  } catch (err) {
    console.error("[GET /api/turmas/:id/tokens]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

// -------------------------------------------------------
// POST /api/turmas/[id]/tokens
// Cria um novo link de acesso para viajante
// Body: { descricao, dias_validade }
// -------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { descricao, dias_validade } = body;

    const dias = Number(dias_validade);
    if (!dias || dias < 1 || dias > 365) {
      return NextResponse.json(
        { erro: "dias_validade deve ser entre 1 e 365." },
        { status: 400 }
      );
    }

    const tokenData = criarTokenAvaliacao(id, descricao ?? "", dias, session.id);

    return NextResponse.json({ data: tokenData }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/turmas/:id/tokens]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

// -------------------------------------------------------
// DELETE /api/turmas/[id]/tokens
// Revoga um token pelo seu ID
// Body: { token_id }
// -------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    await params; // id da turma (não usada aqui mas garante o contexto da rota)
    const body = await req.json();
    const { token_id } = body;

    if (!token_id) {
      return NextResponse.json({ erro: "token_id obrigatório." }, { status: 400 });
    }

    revogarToken(token_id, session.id);

    return NextResponse.json({ mensagem: "Token revogado com sucesso." });
  } catch (err) {
    console.error("[DELETE /api/turmas/:id/tokens]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
