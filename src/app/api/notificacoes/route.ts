import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

// -------------------------------------------------------
// GET /api/notificacoes
// Retorna os audit_logs recentes que indicam mudanças na designação
// -------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    
    if (!desde) return NextResponse.json({ erro: "Parâmetro 'desde' é obrigatório" }, { status: 400 });

    const db = getDb();
    
    // Procura por UPDATEs na tabela designacoes que ocorreram depois do tempo indicado
    const logs = db.prepare(`
      SELECT 
        a.id, a.tabela, a.registo_id, a.dados_depois, a.criado_em,
        pp.titulo, pp.numero as parte_numero,
        e.nome as estudante_nome
      FROM audit_logs a
      JOIN designacoes d ON a.registo_id = d.id
      JOIN programa_partes pp ON d.parte_id = pp.id
      JOIN turma_estudantes te ON d.turma_estudante_id = te.id
      JOIN estudantes e ON te.estudante_id = e.id
      WHERE a.tabela = 'designacoes' 
        AND a.accao = 'UPDATE' 
        AND a.criado_em > ?
      ORDER BY a.criado_em ASC
    `).all(desde) as any[];

    // Tentar parsear o JSON para facilitar a vida ao frontend
    const formatados = logs.map(l => {
      let dados = {};
      try { dados = JSON.parse(l.dados_depois); } catch {}
      return {
        id: l.id,
        registo_id: l.registo_id,
        criado_em: l.criado_em,
        estudante: l.estudante_nome,
        parte: `Parte ${l.parte_numero} (${l.titulo})`,
        dados
      };
    });

    return NextResponse.json({ data: formatados });
  } catch (err) {
    console.error("[GET /api/notificacoes]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
