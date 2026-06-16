import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";
import { registarLog } from "@/lib/logger";

// GET /api/utilizadores
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    if (session.papel !== "admin") {
      return NextResponse.json({ erro: "Ação não autorizada. Apenas administradores podem criar utilizadores." }, { status: 403 });
    }

    const body = await req.json();
    const { nome, email, papel } = body;

    if (!nome || !email) {
      return NextResponse.json({ erro: "Nome e email são obrigatórios" }, { status: 400 });
    }

    const papeisValidos = ["admin", "instrutor", "viajante", "secretaria"];
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
    
    // A senha padrão agora é 12345678
    const senhaPadrao = "12345678";
    
    db.prepare(`
      INSERT INTO utilizadores (id, nome, email, senha_hash, papel, activo, criado_em, actualizado_em, precisa_mudar_senha)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, 1)
    `).run(id, nome, email, hashPassword(senhaPadrao), papel ?? "instrutor", agora, agora);

    const novoUtilizador = db
      .prepare("SELECT id, nome, email, papel, activo, criado_em FROM utilizadores WHERE id = ?")
      .get(id) as any;

    registarLog({
      acao: "Utilizador Criado",
      detalhe: `Novo utilizador "${novoUtilizador.nome}" (${novoUtilizador.papel}) criado por ${session.id}.`,
      severidade: "success",
      utilizadorId: session.id
    });

    return NextResponse.json({ data: novoUtilizador, mensagem: "Utilizador criado com sucesso" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/utilizadores]", err);
    return NextResponse.json({ erro: "Erro ao criar utilizador" }, { status: 500 });
  }
}
