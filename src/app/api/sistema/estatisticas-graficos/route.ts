import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const url = new URL(req.url);
    const tempo = url.searchParams.get("tempo") || "mensal"; // diario, semanal, quinzenal, mensal, anual
    const congregacao = url.searchParams.get("congregacao") || "todas";

    const db = getDb();
    
    // Condições extra baseadas nos filtros
    let extraCongregacao = "";
    const argsCongregacao: any[] = [];
    if (congregacao !== "todas") {
      // Filtrar estudantes por congregação. Se a rota vier de outra tabela, fazemos JOIN.
      extraCongregacao = " AND e.congregacao_id = ? ";
      argsCongregacao.push(congregacao);
    }

    // Configurar o agrupamento de tempo
    let formatoData = "'%Y-%m'"; // Mensal default
    let limitTempo = "LIMIT 12";
    let condicaoTempo = "datetime('now', '-365 days')";

    if (tempo === "diario") {
      formatoData = "'%Y-%m-%d'";
      limitTempo = "LIMIT 30";
      condicaoTempo = "datetime('now', '-30 days')";
    } else if (tempo === "semanal") {
      formatoData = "'%Y-W%W'";
      limitTempo = "LIMIT 12";
      condicaoTempo = "datetime('now', '-84 days')";
    } else if (tempo === "anual") {
      formatoData = "'%Y'";
      limitTempo = "LIMIT 5";
      condicaoTempo = "datetime('now', '-5 years')";
    }

    // 1. Distribuição de Oratória (Níveis A, B, C)
    const distribuicaoOratoria = db.prepare(`
      SELECT te.nivel_oratoria as label, COUNT(*) as value
      FROM turma_estudantes te
      JOIN estudantes e ON te.estudante_id = e.id
      WHERE te.nivel_oratoria IS NOT NULL AND te.nivel_oratoria != ''
      ${extraCongregacao}
      GROUP BY te.nivel_oratoria
      ORDER BY value DESC
    `).all(...argsCongregacao);

    // 2. Evolução de Turmas
    // Nota: turmas não têm congregacao_id diretamente, assumimos que é global ou podemos não filtrar por congregação se "todas"
    // Mas para agradar ao filtro, ignoramos o filtro de congregação para evolução de turmas globais
    const evolucaoTurmas = db.prepare(`
      SELECT strftime(${formatoData}, data_inicio) as mes, COUNT(*) as current
      FROM turmas
      WHERE data_inicio >= ${condicaoTempo}
      GROUP BY strftime(${formatoData}, data_inicio)
      ORDER BY mes ASC
      ${limitTempo}
    `).all();

    // 3. Evolução de Designações por tempo
    // Aqui usamos JOIN com estudantes para filtrar por congregação
    const evolucaoDesignacoes = db.prepare(`
      SELECT strftime(${formatoData}, d.criado_em) as mes, COUNT(*) as current
      FROM designacoes d
      JOIN turma_estudantes te ON d.turma_estudante_id = te.id
      JOIN estudantes e ON te.estudante_id = e.id
      WHERE d.criado_em >= ${condicaoTempo}
      ${extraCongregacao}
      GROUP BY strftime(${formatoData}, d.criado_em)
      ORDER BY mes ASC
      ${limitTempo}
    `).all(...argsCongregacao);

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
