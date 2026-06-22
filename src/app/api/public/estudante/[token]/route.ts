import { NextRequest, NextResponse } from "next/server";
import { obterTurmaEstudantePorToken, historicoEstudante } from "@/lib/repositories/estudantes";
import { listarDesignacoesDoEstudante, confirmarDesignacao, recusarDesignacao } from "@/lib/repositories/designacoes";
import getDb from "@/lib/db";

// Campos confidenciais que o aluno NÃO deve ver
const CAMPOS_CONFIDENCIAIS = ["idade", "anos_batismo", "nivel_oratoria", "avaliado_pelo_viajante", "data_avaliacao", "fotografia", "token_acesso"];

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

    // ── Verificar expiração: o link expira no 1º dia de aulas ──
    if (estudante.data_inicio) {
      const dataInicio = new Date(estudante.data_inicio);
      // Considera expirado a partir do início do dia da data_inicio (00:00 hora local)
      dataInicio.setHours(0, 0, 0, 0);
      const agora = new Date();
      if (agora >= dataInicio) {
        return NextResponse.json(
          { erro: "O seu acesso a este portal expirou. As aulas já tiveram início. Por favor, contacte os instrutores caso precise de informação adicional." },
          { status: 410 }
        );
      }
    }

    const db = getDb();
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || req.headers.get("x-real-ip")
      || "127.0.0.1";
    db.prepare("INSERT INTO logs (acao, detalhe, severidade, ip_address) VALUES (?, ?, ?, ?)").run(
      "acesso_portal_estudante",
      `Acesso ao portal pelo estudante ${estudante.estudante_nome || estudante.nome}`,
      "info",
      ipAddress
    );

    const designacoes = listarDesignacoesDoEstudante(estudante.id);
    const historico = historicoEstudante(estudante.estudante_id);

    // Remover campos confidenciais antes de enviar
    const estudanteSeguro = { ...estudante };
    for (const campo of CAMPOS_CONFIDENCIAIS) {
      delete estudanteSeguro[campo];
    }

    return NextResponse.json({
      data: {
        estudante: estudanteSeguro,
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
