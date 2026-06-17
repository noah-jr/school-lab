import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const db = getDb();

    // 1. Distribuição de Oratória (Níveis A, B, C)
    const distribuicaoOratoria = db.prepare(`
      SELECT nivel_oratoria as label, COUNT(*) as value
      FROM turma_estudantes
      WHERE nivel_oratoria IS NOT NULL AND nivel_oratoria != ''
      GROUP BY nivel_oratoria
      ORDER BY value DESC
    `).all();

    // 2. Evolução Mensal de Turmas (últimos 12 meses)
    // Opcionalmente podemos juntar os meses. Para manter simples, vamos contar as turmas criadas por mês.
    const evolucaoTurmas = db.prepare(`
      SELECT strftime('%Y-%m', data_inicio) as mes, COUNT(*) as current
      FROM turmas
      GROUP BY strftime('%Y-%m', data_inicio)
      ORDER BY mes ASC
      LIMIT 12
    `).all();

    // 3. Evolução de Designações por mês (Processamento)
    const evolucaoDesignacoes = db.prepare(`
      SELECT strftime('%Y-%m', criado_em) as mes, COUNT(*) as current
      FROM designacoes
      GROUP BY strftime('%Y-%m', criado_em)
      ORDER BY mes ASC
      LIMIT 12
    `).all();

    return NextResponse.json({
      distribuicaoOratoria: distribuicaoOratoria.length ? distribuicaoOratoria : [{label: "Sem dados", value: 1}],
      evolucaoTurmas,
      evolucaoDesignacoes
    });
  } catch (err: any) {
    console.error("[GET /api/sistema/estatisticas-graficos]", err);
    return NextResponse.json({ erro: "Erro ao obter dados de gráficos" }, { status: 500 });
  }
}
