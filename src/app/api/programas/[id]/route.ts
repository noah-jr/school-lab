import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

// PATCH /api/programas/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    const campos: string[] = [];
    const valores: any[] = [];
    if (body.nome !== undefined)     { campos.push("nome = ?");     valores.push(body.nome); }
    if (body.descricao !== undefined) { campos.push("descricao = ?"); valores.push(body.descricao); }

    if (campos.length === 0) return NextResponse.json({ erro: "Nenhum campo para actualizar" }, { status: 400 });

    valores.push(id);
    db.prepare(`UPDATE programas SET ${campos.join(", ")} WHERE id = ?`).run(...valores);

    const programa = db.prepare("SELECT * FROM programas WHERE id = ?").get(id);
    return NextResponse.json({ data: programa, mensagem: "Programa actualizado" });
  } catch (err) {
    console.error("[PATCH /api/programas/[id]]", err);
    return NextResponse.json({ erro: "Erro ao actualizar programa" }, { status: 500 });
  }
}

// DELETE /api/programas/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    // Verificar se há turmas a usar este programa
    const turmasComPrograma = db.prepare("SELECT COUNT(*) as c FROM turmas WHERE programa_id = ?").get(id) as any;
    if (turmasComPrograma.c > 0) {
      return NextResponse.json({ erro: `Não é possível eliminar: ${turmasComPrograma.c} turma(s) usam este programa.` }, { status: 409 });
    }

    db.prepare("DELETE FROM programa_partes WHERE programa_id = ?").run(id);
    db.prepare("DELETE FROM programas WHERE id = ?").run(id);

    return NextResponse.json({ mensagem: "Programa eliminado com sucesso" });
  } catch (err) {
    console.error("[DELETE /api/programas/[id]]", err);
    return NextResponse.json({ erro: "Erro ao eliminar programa" }, { status: 500 });
  }
}
