import { NextRequest, NextResponse } from "next/server";
import { listarProgramas, listarPartes } from "@/lib/repositories/programas";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const partesId = url.searchParams.get("programa_id");

    if (partesId) {
      const data = listarPartes(partesId);
      return NextResponse.json({ data });
    }

    const data = listarProgramas();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[GET /api/programas]", err);
    return NextResponse.json({ erro: "Erro ao listar programas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const { nome, descricao } = body;
    if (!nome) return NextResponse.json({ erro: "Nome é obrigatório" }, { status: 400 });

    const db = getDb();
    const id = uuid();
    db.prepare("INSERT INTO programas (id, nome, descricao) VALUES (?, ?, ?)").run(id, nome, descricao || "");

    const programa = db.prepare("SELECT * FROM programas WHERE id = ?").get(id);
    return NextResponse.json({ data: programa, mensagem: "Programa criado" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/programas]", err);
    return NextResponse.json({ erro: "Erro ao criar programa" }, { status: 500 });
  }
}
