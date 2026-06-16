import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";
import { criarAuditLog } from "@/lib/db/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.papel !== "admin" && session.papel !== "instrutor")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { assunto, conteudo } = await req.json();

    if (!assunto || !conteudo) {
      return NextResponse.json({ erro: "Assunto e Conteúdo são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    
    // Obter nome do estudante para o log de auditoria
    const estudante = db.prepare("SELECT nome, email_jwpub FROM estudantes WHERE id = ?").get(id) as any;
    if (!estudante) {
      return NextResponse.json({ erro: "Estudante não encontrado" }, { status: 404 });
    }

    // Criar o log no banco
    db.prepare(`
      INSERT INTO logs (acao, detalhe, severidade, utilizador_id)
      VALUES (?, ?, ?, ?)
    `).run(
      "Notificação Enviada",
      `Notificação enviada para ${estudante.nome} (${estudante.email_jwpub || 'Sem E-mail'}). Assunto: "${assunto}"`,
      "info",
      session.id
    );

    return NextResponse.json({ mensagem: "Notificação enviada e registada com sucesso." });
  } catch (err: any) {
    console.error("[POST /api/estudantes/[id]/notificar]", err);
    return NextResponse.json({ erro: "Erro ao enviar notificação" }, { status: 500 });
  }
}
