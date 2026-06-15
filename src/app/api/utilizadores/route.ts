import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { v4 as uuid } from "uuid";

// GET /api/utilizadores
export async function GET() {
  try {
    const db = getDb();
    const utilizadores = db
      .prepare("SELECT id, nome, email, papel, activo, criado_em FROM utilizadores ORDER BY criado_em DESC")
      .all();
    return NextResponse.json({ data: utilizadores });
  } catch (err) {
    console.error("[GET /api/utilizadores]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}

// POST /api/utilizadores
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, password, papel } = body;

    if (!nome || !email || !password) {
      return NextResponse.json({ erro: "Nome, email e password são obrigatórios" }, { status: 400 });
    }

    const papeisValidos = ["admin", "instrutor", "viajante"];
    if (papel && !papeisValidos.includes(papel)) {
      return NextResponse.json({ erro: "Papel inválido" }, { status: 400 });
    }

    const db = getDb();

    const existente = db.prepare("SELECT id FROM utilizadores WHERE email = ?").get(email);
    if (existente) {
      return NextResponse.json({ erro: "Já existe um utilizador com este email" }, { status: 409 });
    }

    const id = uuid();
    const agora = new Date().toISOString();
    db.prepare(`
      INSERT INTO utilizadores (id, nome, email, senha_hash, papel, activo, criado_em, actualizado_em)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, nome, email, hashPassword(password), papel ?? "instrutor", agora, agora);

    const novoUtilizador = db
      .prepare("SELECT id, nome, email, papel, activo, criado_em FROM utilizadores WHERE id = ?")
      .get(id);

    return NextResponse.json({ data: novoUtilizador, mensagem: "Utilizador criado com sucesso" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/utilizadores]", err);
    return NextResponse.json({ erro: "Erro ao criar utilizador" }, { status: 500 });
  }
}
