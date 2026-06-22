import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, novaPassword } = await req.json();

    if (!email || !novaPassword) {
      return NextResponse.json({ erro: "Todos os campos (Email e Nova Senha) são obrigatórios." }, { status: 400 });
    }

    const utilizador = db.prepare("SELECT id FROM utilizadores WHERE email = ?").get(email);
    if (!utilizador) {
      return NextResponse.json({ erro: "Email não encontrado no sistema." }, { status: 404 });
    }

    const novaSenhaHash = hashPassword(novaPassword);
    
    db.prepare("UPDATE utilizadores SET senha_hash = ?, actualizado_em = datetime('now') WHERE email = ?").run(novaSenhaHash, email);

    return NextResponse.json({ mensagem: "Password atualizada com sucesso! Pode iniciar sessão." });
  } catch (err) {
    console.error("[POST /api/auth/reset]", err);
    return NextResponse.json({ erro: "Erro interno ao atualizar a password" }, { status: 500 });
  }
}
