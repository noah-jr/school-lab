import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpRepository } from "@/lib/repositories/otps";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, codigo, novaPassword } = await req.json();

    if (!email || !codigo || !novaPassword) {
      return NextResponse.json({ erro: "Todos os campos (Email, OTP e Nova Senha) são obrigatórios." }, { status: 400 });
    }

    const valido = otpRepository.validarOTP(email, codigo, "recuperacao");
    
    if (!valido) {
      return NextResponse.json({ erro: "Código OTP inválido ou expirado." }, { status: 400 });
    }

    const novaSenhaHash = hashPassword(novaPassword);
    
    db.prepare("UPDATE utilizadores SET senha_hash = ?, actualizado_em = datetime('now') WHERE email = ?").run(novaSenhaHash, email);

    return NextResponse.json({ mensagem: "Password atualizada com sucesso! Pode iniciar sessão." });
  } catch (err) {
    console.error("[POST /api/auth/reset]", err);
    return NextResponse.json({ erro: "Erro interno ao atualizar a password" }, { status: 500 });
  }
}
