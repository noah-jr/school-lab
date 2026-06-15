import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

// PATCH /api/utilizadores/[id] — activar/desactivar utilizador
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    const CAMPOS_PERMITIDOS = ["nome", "papel", "activo"];
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
      .get(id);

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
    const { id } = await params;
    const db = getDb();
    const agora = new Date().toISOString();
    db.prepare("UPDATE utilizadores SET activo = 0, actualizado_em = ? WHERE id = ?").run(agora, id);
    return NextResponse.json({ mensagem: "Utilizador desactivado" });
  } catch (err) {
    console.error("[DELETE /api/utilizadores/[id]]", err);
    return NextResponse.json({ erro: "Erro ao desactivar utilizador" }, { status: 500 });
  }
}
