import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const db = getDb();
    const user = db.prepare("SELECT id, nome, email, papel, activo, precisa_mudar_senha, criado_em FROM utilizadores WHERE id = ?").get(session.id);
    return NextResponse.json({ data: user });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao ler perfil" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { nome, email, password } = body;
    const db = getDb();

    if (email) {
      const existente = db.prepare("SELECT id FROM utilizadores WHERE email = ? AND id != ?").get(email, session.id);
      if (existente) {
        return NextResponse.json({ erro: "Este email já está em uso por outro utilizador." }, { status: 409 });
      }
    }

    const agora = new Date().toISOString();

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ erro: "A senha deve ter no mínimo 6 caracteres." }, { status: 400 });
      }
      const hash = hashPassword(password);
      db.prepare("UPDATE utilizadores SET nome = ?, email = ?, senha_hash = ?, precisa_mudar_senha = 0, actualizado_em = ? WHERE id = ?").run(
        nome ?? session.nome, email ?? session.email, hash, agora, session.id
      );
    } else {
      db.prepare("UPDATE utilizadores SET nome = ?, email = ?, actualizado_em = ? WHERE id = ?").run(
        nome ?? session.nome, email ?? session.email, agora, session.id
      );
    }

    registarLog({
      acao: "Perfil Atualizado",
      detalhe: `Utilizador atualizou o seu perfil${password ? " e alterou a palavra-passe" : ""}.`,
      severidade: "info",
      utilizadorId: session.id
    });

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
