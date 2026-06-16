import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPassword, verifyPassword, createSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";
import { registarLog } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ erro: "Email e password são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    
    let utilizador = db.prepare("SELECT * FROM utilizadores WHERE email = ? AND activo = 1").get(email) as any;
    
    // Se a tabela estiver vazia e for o admin, criamos o utilizador admin raiz.
    if (!utilizador && email === "admin@jwpub.org") {
      const adminCheck = db.prepare("SELECT count(*) as c FROM utilizadores").get() as any;
      if (adminCheck.c === 0) {
        const adminId = uuid();
        db.prepare(`
          INSERT INTO utilizadores (id, nome, email, senha_hash, papel)
          VALUES (?, ?, ?, ?, ?)
        `).run(adminId, "Administrador Principal", email, hashPassword(password), "admin");
        utilizador = db.prepare("SELECT * FROM utilizadores WHERE id = ?").get(adminId);
      } else {
        registarLog({ acao: "Login Falhado", detalhe: `Tentativa de login falhada para o email: ${email}`, severidade: "warning" });
        return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
      }
    } else if (!utilizador) {
      registarLog({ acao: "Login Falhado", detalhe: `Tentativa de login falhada para o email: ${email}`, severidade: "warning" });
      return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
    }

    if (!verifyPassword(password, utilizador.senha_hash)) {
      registarLog({ acao: "Login Falhado", detalhe: `Password incorreta para o utilizador: ${utilizador.nome}`, severidade: "warning", utilizadorId: utilizador.id });
      return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
    }

    const sessionToken = createSession(utilizador.id);

    registarLog({
      acao: "Login Efetuado",
      detalhe: `${utilizador.nome} (${utilizador.papel}) iniciou sessão no sistema.`,
      severidade: "success",
      utilizadorId: utilizador.id
    });

    const response = NextResponse.json({
      mensagem: "Login bem-sucedido",
      user: {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        papel: utilizador.papel
      }
    }, { status: 200 });

    response.cookies.set("eac_session", sessionToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ erro: "Erro ao tentar iniciar sessão" }, { status: 500 });
  }
}
