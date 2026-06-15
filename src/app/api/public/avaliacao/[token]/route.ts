import { NextRequest, NextResponse } from "next/server";
import { runMigrations } from "@/lib/db";
import {
  validarToken,
  listarEstudantesParaAvaliar,
  submeterAvaliacao,
} from "@/lib/repositories/tokens";

// -------------------------------------------------------
// GET /api/public/avaliacao/[token]
// Valida o token e retorna os dados da turma + estudantes
// -------------------------------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    runMigrations();
    const { token } = await params;

    const tokenData = validarToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { erro: "Link inválido, expirado ou revogado." },
        { status: 403 }
      );
    }

    const estudantes = listarEstudantesParaAvaliar(tokenData.turma_id);

    return NextResponse.json({
      data: {
        turma: {
          id: tokenData.turma_id,
          nome: tokenData.turma_nome,
          numero_turma: tokenData.turma_numero,
        },
        token: {
          descricao: tokenData.descricao,
          expira_em: tokenData.expira_em,
        },
        estudantes,
      },
    });
  } catch (err) {
    console.error("[GET /api/public/avaliacao/:token]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

// -------------------------------------------------------
// POST /api/public/avaliacao/[token]
// Submete a avaliação de um estudante
// Body: { turma_estudante_id, nivel_oratoria, observacoes? }
// -------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const tokenData = validarToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { erro: "Link inválido, expirado ou revogado." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { turma_estudante_id, nivel_oratoria, observacoes } = body;

    if (!turma_estudante_id || !nivel_oratoria) {
      return NextResponse.json(
        { erro: "Campos obrigatórios: turma_estudante_id, nivel_oratoria." },
        { status: 400 }
      );
    }

    const NIVEIS_VALIDOS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "NR"];
    if (!NIVEIS_VALIDOS.includes(nivel_oratoria)) {
      return NextResponse.json(
        { erro: `Nível inválido. Use um de: ${NIVEIS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    let nivel_bd = nivel_oratoria;
    let obs_bd = observacoes ?? null;

    if (nivel_oratoria === "NR") {
      nivel_bd = null;
      obs_bd = obs_bd ? `[NR - Limitações de Idade/Saúde] ${obs_bd}` : "[NR] Não Recomendado (Limitações de Idade/Saúde)";
    }

    submeterAvaliacao(turma_estudante_id, nivel_bd, obs_bd);

    return NextResponse.json({ mensagem: "Avaliação registada com sucesso." });
  } catch (err) {
    console.error("[POST /api/public/avaliacao/:token]", err);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
