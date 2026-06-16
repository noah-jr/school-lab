import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpRepository } from "@/lib/repositories/otps";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ erro: "Email é obrigatório" }, { status: 400 });
    }

    // Verifica se o utilizador existe
    const utilizador = db.prepare("SELECT id FROM utilizadores WHERE email = ?").get(email);
    if (!utilizador) {
      // Retornar 200 de qualquer modo para não vazar a base de dados a hackers
      return NextResponse.json({ mensagem: "Se o email existir na nossa base de dados, um código OTP será enviado em instantes." });
    }

    // Gera o OTP (que seria enviado por email em produção)
    otpRepository.gerarOTP(email, "recuperacao");

    return NextResponse.json({ mensagem: "Código OTP enviado para o seu email com sucesso." });
  } catch (err) {
    console.error("[POST /api/auth/recuperar]", err);
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500 });
  }
}
