import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { nome, email, password } = await req.json();

    if (!nome || !email || !password) {
      return NextResponse.json({ erro: "Nome, email e password são obrigatórios" }, { status: 400 });
    }

    const existente = db.prepare("SELECT id FROM utilizadores WHERE email = ?").get(email);
    if (existente) {
      return NextResponse.json({ erro: "Este email já se encontra registado." }, { status: 409 });
    }

    const id = uuid();
    // Por defeito, os novos registos públicos criam uma conta de "secretaria" que começa inativa (activo = 0).
    // O Administrador terá de aprovar a conta no Painel de Utilizadores.
    db.prepare(`
      INSERT INTO utilizadores (id, nome, email, senha_hash, papel, activo)
      VALUES (?, ?, ?, ?, 'secretaria', 0)
    `).run(id, nome, email, hashPassword(password));

    return NextResponse.json({ mensagem: "Conta criada com sucesso! A sua conta encontra-se pendente de aprovação pela Administração." }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/registar]", err);
    return NextResponse.json({ erro: "Erro interno ao criar conta." }, { status: 500 });
  }
}
