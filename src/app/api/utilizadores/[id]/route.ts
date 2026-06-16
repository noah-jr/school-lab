import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

// PATCH /api/utilizadores/[id] — activar/desactivar/editar utilizador
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    if (session.papel !== "admin") {
      return NextResponse.json({ erro: "Ação não autorizada. Apenas administradores podem alterar utilizadores." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    // Impedir que o próprio admin mude o seu próprio papel ou se desative por engano
    if (id === session.id) {
      if (body.activo === 0 || (body.papel && body.papel !== "admin")) {
        return NextResponse.json({ erro: "Não pode desativar-se nem alterar o seu próprio papel de acesso." }, { status: 400 });
      }
    }

    const CAMPOS_PERMITIDOS = ["nome", "email", "papel", "activo"];
    const input: Record<string, unknown> = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (campo in body) input[campo] = body[campo];
    }

    if (Object.keys(input).length === 0) {
      return NextResponse.json({ erro: "Nenhum campo para actualizar" }, { status: 400 });
    }

    const campos = Object.keys(input);
    const set = campos.map((c) => `${c} = ?`).join(", ");
    const valores = campos.map((c) => input[c]);
    const agora = new Date().toISOString();

    db.prepare(`UPDATE utilizadores SET ${set}, actualizado_em = ? WHERE id = ?`).run(
      ...valores, agora, id
    );

    const utilizador = db
      .prepare("SELECT id, nome, email, papel, activo, criado_em FROM utilizadores WHERE id = ?")
      .get(id) as any;

    const acao = input.activo !== undefined
      ? (input.activo ? "Utilizador Reativado" : "Utilizador Desativado")
      : (input.papel ? "Papel de Utilizador Alterado" : "Utilizador Atualizado");

    registarLog({
      acao,
      detalhe: `Utilizador "${utilizador.nome}" (ID: ${id}) atualizado pelo admin.`,
      severidade: input.activo === 0 ? "warning" : "info",
      utilizadorId: session.id
    });

    return NextResponse.json({ data: utilizador, mensagem: "Utilizador actualizado" });
  } catch (err) {
    console.error("[PATCH /api/utilizadores/[id]]", err);
    return NextResponse.json({ erro: "Erro ao actualizar utilizador" }, { status: 500 });
  }
}

// DELETE /api/utilizadores/[id] — soft delete (desactivar)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    if (session.papel !== "admin") {
      return NextResponse.json({ erro: "Ação não autorizada. Apenas administradores podem desativar utilizadores." }, { status: 403 });
    }

    const { id } = await params;
    if (id === session.id) {
      return NextResponse.json({ erro: "Não pode desativar a sua própria conta." }, { status: 400 });
    }

    const db = getDb();
    const alvo = db.prepare("SELECT nome FROM utilizadores WHERE id = ?").get(id) as any;
    const agora = new Date().toISOString();
    db.prepare("UPDATE utilizadores SET activo = 0, actualizado_em = ? WHERE id = ?").run(agora, id);

    registarLog({
      acao: "Utilizador Desativado",
      detalhe: `Conta de "${alvo?.nome || id}" desativada pelo administrador.`,
      severidade: "warning",
      utilizadorId: session.id
    });

    return NextResponse.json({ mensagem: "Utilizador desactivado" });
  } catch (err) {
    console.error("[DELETE /api/utilizadores/[id]]", err);
    return NextResponse.json({ erro: "Erro ao desactivar utilizador" }, { status: 500 });
  }
}
