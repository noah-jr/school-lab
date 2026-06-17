import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const pagina = Number(searchParams.get("pagina") || "1");
    const porPagina = Number(searchParams.get("por_pagina") || "20");
    const offset = (pagina - 1) * porPagina;

    const db = getDb();
    
    // Garantir que a tabela existe (com ip_address já incluído)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilizador_id TEXT,
        acao TEXT NOT NULL,
        detalhe TEXT NOT NULL,
        severidade TEXT NOT NULL DEFAULT 'info',
        ip_address TEXT,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
      )
    `).run();

    let baseQuery = `
      FROM logs l
      LEFT JOIN utilizadores u ON l.utilizador_id = u.id
    `;
    let countParams: any[] = [];
    let queryParams: any[] = [];

    if (q) {
      baseQuery += ` WHERE l.acao LIKE ? OR l.detalhe LIKE ? OR u.nome LIKE ? `;
      const likeQ = `%${q}%`;
      countParams = [likeQ, likeQ, likeQ];
      queryParams = [likeQ, likeQ, likeQ];
    }

    const totalRow = db.prepare(`SELECT COUNT(*) as total ${baseQuery}`).get(...countParams) as any;
    const total = totalRow.total;

    const logs = db.prepare(`
      SELECT l.*, u.nome AS utilizador_nome 
      ${baseQuery}
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
    `).all(...queryParams, porPagina, offset);

    return NextResponse.json({ 
      data: logs,
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina)
    });
  } catch (err: any) {
    console.error("[GET /api/logs]", err);
    return NextResponse.json({ erro: "Erro ao ler logs", detalhe: err.message }, { status: 500 });
  }
}
