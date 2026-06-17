import { NextRequest, NextResponse } from "next/server";
import { obterTurmaEstudantePorToken, historicoEstudante } from "@/lib/repositories/estudantes";
import { listarDesignacoesDoEstudante, confirmarDesignacao, recusarDesignacao } from "@/lib/repositories/designacoes";
import getDb from "@/lib/db";

// -------------------------------------------------------
// GET /api/public/estudante/[token]
// Valida o token e retorna os dados do estudante + designações
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const estudante = obterTurmaEstudantePorToken(token);
    if (!estudante) {
      return NextResponse.json(
        { erro: "Link inválido ou não encontrado." },
        { status: 404 }
      );
    }

    const db = getDb();
    db.prepare("INSERT INTO logs (acao, detalhe, severidade) VALUES (?, ?, ?)").run(
      "acesso_portal_estudante",
      `Acesso ao portal pelo estudante ${estudante.estudante_nome || estudante.nome}`,
      "info"
    );

    const designacoes = listarDesignacoesDoEstudante(estudante.id);
    const historico = historicoEstudante(estudante.estudante_id);

    return NextResponse.json({
      data: {
        estudante,
        designacoes,
        historico
      },
    });
  } catch (err) {
    console.error("[GET /api/public/estudante/:token]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

// -------------------------------------------------------
// POST /api/public/estudante/[token]
// Confirma ou recusa uma designação
// Body: { designacao_id, accao: "confirmar" | "recusar", motivo?: string }
// -------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const estudante = obterTurmaEstudantePorToken(token);
    if (!estudante) {
      return NextResponse.json(
        { erro: "Link inválido." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { designacao_id, accao = "confirmar", motivo } = body;

    if (!designacao_id) {
      return NextResponse.json({ erro: "designacao_id é obrigatório." }, { status: 400 });
    }

    // Validar se a designação pertence a este estudante
    const designacoes = listarDesignacoesDoEstudante(estudante.id);
    const pertence = designacoes.some(d => (d as any).designacao_id === designacao_id);
    
    if (!pertence) {
      return NextResponse.json({ erro: "Ação não autorizada." }, { status: 403 });
    }

    if (accao === "recusar") {
      if (!motivo) return NextResponse.json({ erro: "O motivo é obrigatório ao recusar." }, { status: 400 });
      recusarDesignacao(designacao_id, motivo);
      return NextResponse.json({ mensagem: "Designação recusada com sucesso." });
    }

    confirmarDesignacao(designacao_id);
    return NextResponse.json({ mensagem: "Designação confirmada com sucesso." });
  } catch (err) {
    console.error("[POST /api/public/estudante/:token]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
