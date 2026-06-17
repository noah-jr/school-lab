import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const db = getDb();

    // 1. Totais por tipo de portal/página pública
    const totaisRows = db.prepare(`
      SELECT acao, COUNT(*) as total
      FROM logs
      WHERE acao IN ('acesso_portal_estudante', 'acesso_portal_viajante', 'acesso_internauta')
      GROUP BY acao
    `).all() as { acao: string; total: number }[];

    const totais = {
      estudante: totaisRows.find(r => r.acao === 'acesso_portal_estudante')?.total || 0,
      viajante: totaisRows.find(r => r.acao === 'acesso_portal_viajante')?.total || 0,
      internauta: totaisRows.find(r => r.acao === 'acesso_internauta')?.total || 0,
    };

    // 2. Acessos por dia (últimos 30 dias)
    const diaria = db.prepare(`
      SELECT date(criado_em) as data, COUNT(*) as acessos
      FROM logs
      WHERE acao IN ('acesso_portal_estudante', 'acesso_portal_viajante', 'acesso_internauta')
        AND criado_em >= datetime('now', '-30 days')
      GROUP BY date(criado_em)
      ORDER BY data ASC
    `).all() as { data: string; acessos: number }[];

    // 3. Acessos por semana (últimas 12 semanas)
    const semanal = db.prepare(`
      SELECT strftime('%Y-W%W', criado_em) as semana, COUNT(*) as acessos
      FROM logs
      WHERE acao IN ('acesso_portal_estudante', 'acesso_portal_viajante', 'acesso_internauta')
        AND criado_em >= datetime('now', '-84 days') -- 12 semanas
      GROUP BY strftime('%Y-W%W', criado_em)
      ORDER BY semana ASC
    `).all() as { semana: string; acessos: number }[];

    // 4. Acessos por mês (últimos 12 meses)
    const mensal = db.prepare(`
      SELECT strftime('%Y-%m', criado_em) as mes, COUNT(*) as acessos
      FROM logs
      WHERE acao IN ('acesso_portal_estudante', 'acesso_portal_viajante', 'acesso_internauta')
        AND criado_em >= datetime('now', '-365 days')
      GROUP BY strftime('%Y-%m', criado_em)
      ORDER BY mes ASC
    `).all() as { mes: string; acessos: number }[];

    return NextResponse.json({
      totais,
      diaria,
      semanal,
      mensal
    });
  } catch (err: any) {
    console.error("[GET /api/sistema/acessos-portais]", err);
    return NextResponse.json({ erro: "Erro ao calcular métricas", detalhe: err.message }, { status: 500 });
  }
}
