import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";
import path from "path";
import getDb, { runMigrations } from "@/lib/db";
import { criarAuditLog } from "@/lib/db/audit";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

// Garante que o directório de uploads existe
async function garantirDirectorio() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    await garantirDirectorio();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const turmaId = formData.get("turma_id") as string | null;
    const tipoUpload = formData.get("tipo_upload") as string | null;

    if (!file) {
      return NextResponse.json({ erro: "Nenhum ficheiro fornecido" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const nomeOriginal = file.name;
    const extensao = path.extname(nomeOriginal);
    const nomeFicheiro = `${uuid()}${extensao}`;
    const caminho = path.join("data", "uploads", nomeFicheiro);
    const caminhoAbsoluto = path.join(UPLOAD_DIR, nomeFicheiro);

    // Gravar no disco (Upload Local)
    await fs.writeFile(caminhoAbsoluto, buffer);

    // Gravar metadados na base de dados
    runMigrations();
    const db = getDb();
    const id = uuid();
    const agora = new Date().toISOString();
    const tipo = tipoUpload ?? "outro";

    db.transaction(() => {
      db.prepare(`
        INSERT INTO uploads (id, turma_id, nome_original, nome_ficheiro, caminho, tipo_mime, tamanho_bytes, tipo_upload, processado, criado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(
        id,
        turmaId ?? null,
        nomeOriginal,
        nomeFicheiro,
        caminho,
        file.type,
        file.size,
        tipo,
        agora
      );

      criarAuditLog({
        tabela: "uploads",
        registoId: id,
        accao: "INSERT",
        dadosDepois: { nomeOriginal, caminho, tipo, tamanho: file.size, turmaId }
      });
    })();

    return NextResponse.json({ 
      mensagem: "Ficheiro carregado com sucesso", 
      data: { id, nomeOriginal, caminho } 
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/public/upload]", err);
    return NextResponse.json({ erro: "Erro ao processar o upload" }, { status: 500 });
  }
}
