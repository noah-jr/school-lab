import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, mensagem } = body;

    if (!nome || !mensagem) {
      return NextResponse.json({ erro: "Nome e mensagem são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    
    // Insere o feedback como uma mensagem global para os admins
    db.prepare(`
      INSERT INTO mensagens (remetente_nome, remetente_email, assunto, conteudo, destinatario_id) 
      VALUES (?, ?, ?, ?, NULL)
    `).run(nome, email || null, "Novo Feedback / Contacto (Landing Page)", mensagem);

    // Regista no log global
    db.prepare("INSERT INTO logs (acao, detalhe, severidade) VALUES (?, ?, ?)").run(
      "Feedback", `Recebido feedback de ${nome}`, "info"
    );

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao submeter feedback" }, { status: 500 });
  }
}
