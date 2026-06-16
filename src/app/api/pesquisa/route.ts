import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({ data: { estudantes: [], turmas: [], utilizadores: [] } });
    }

    const db = getDb();
    const cleanQuery = `%${query.trim()}%`;

    // 1. Pesquisa de Estudantes
    const estudantes = db.prepare(`
      SELECT id, nome, papel_ministerial, activo 
      FROM estudantes 
      WHERE nome LIKE ? AND activo = 1
      LIMIT 5
    `).all(cleanQuery);

    // 2. Pesquisa de Turmas
    const turmas = db.prepare(`
      SELECT id, nome, numero_turma, status 
      FROM turmas 
      WHERE nome LIKE ? OR CAST(numero_turma AS TEXT) LIKE ?
      LIMIT 5
    `).all(cleanQuery, cleanQuery);

    // 3. Pesquisa de Utilizadores (apenas se for admin)
    let utilizadores: any[] = [];
    if (session.papel === "admin") {
      utilizadores = db.prepare(`
        SELECT id, nome, papel, email 
        FROM utilizadores 
        WHERE nome LIKE ? OR email LIKE ?
        LIMIT 5
      `).all(cleanQuery, cleanQuery);
    }

    return NextResponse.json({
      data: {
        estudantes,
        turmas,
        utilizadores
      }
    });
  } catch (err: any) {
    console.error("[GET /api/pesquisa]", err);
    return NextResponse.json({ erro: "Erro na pesquisa" }, { status: 500 });
  }
}
