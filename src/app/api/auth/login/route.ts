import { NextRequest, NextResponse } from "next/server";
import getDb, { runMigrations } from "@/lib/db";
import { hashPassword, verifyPassword, createSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";

let migrado = false;
function garantirMigracoes() {
  if (!migrado) { runMigrations(); migrado = true; }
}

export async function POST(req: NextRequest) {
  try {
    garantirMigracoes();
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
        return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
      }
    } else if (!utilizador) {
      return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
    }

    if (!verifyPassword(password, utilizador.senha_hash)) {
      return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
    }

    const sessionToken = createSession(utilizador.id);

    const response = NextResponse.json({
      mensagem: "Login bem-sucedido",
      user: {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        papel: utilizador.papel
      }
    }, { status: 200 });

    // Configuração de cookie de sessão segura
    response.cookies.set("eac_session", sessionToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ erro: "Erro ao tentar iniciar sessão" }, { status: 500 });
  }
}
