import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.papel !== "admin" && session.papel !== "instrutor")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { docId } = await params;
    const db = getDb();

    // Encontrar o documento
    const doc = db.prepare(`SELECT * FROM documentos_estudantes WHERE id = ?`).get(docId) as any;
    if (!doc) {
      return NextResponse.json({ erro: "Documento não encontrado" }, { status: 404 });
    }

    // Remover ficheiro do disco
    const filePath = path.join(process.cwd(), "public", doc.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remover do banco
    db.prepare(`DELETE FROM documentos_estudantes WHERE id = ?`).run(docId);

    return NextResponse.json({ mensagem: "Documento removido com sucesso" });
  } catch (err: any) {
    console.error("[DELETE /api/estudantes/[id]/documentos/[docId]]", err);
    return NextResponse.json({ erro: "Erro ao apagar documento" }, { status: 500 });
  }
}
