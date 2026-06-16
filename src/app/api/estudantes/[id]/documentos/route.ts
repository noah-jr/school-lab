import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Garante que o diretório de uploads existe
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documentos");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function initDb() {
  const db = getDb();
  db.prepare(`
    CREATE TABLE IF NOT EXISTS documentos_estudantes (
      id TEXT PRIMARY KEY,
      estudante_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      tamanho INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      url TEXT NOT NULL,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estudante_id) REFERENCES estudantes(id) ON DELETE CASCADE
    )
  `).run();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    initDb();
    const db = getDb();
    const docs = db.prepare(`
      SELECT * FROM documentos_estudantes 
      WHERE estudante_id = ? 
      ORDER BY criado_em DESC
    `).all(id);

    return NextResponse.json({ data: docs });
  } catch (err: any) {
    console.error("[GET /api/estudantes/[id]/documentos]", err);
    return NextResponse.json({ erro: "Erro ao ler documentos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { id: estudanteId } = await params;
    initDb();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ erro: "Nenhum ficheiro enviado" }, { status: 400 });
    }

    const fileId = uuidv4();
    const extension = path.extname(file.name);
    const fileName = `${fileId}${extension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const db = getDb();
    const url = `/uploads/documentos/${fileName}`;
    
    db.prepare(`
      INSERT INTO documentos_estudantes (id, estudante_id, nome, tamanho, tipo, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(fileId, estudanteId, file.name, file.size, file.type, url);

    const newDoc = db.prepare(`SELECT * FROM documentos_estudantes WHERE id = ?`).get(fileId);

    return NextResponse.json({ data: newDoc, mensagem: "Ficheiro carregado com sucesso" });
  } catch (err: any) {
    console.error("[POST /api/estudantes/[id]/documentos]", err);
    return NextResponse.json({ erro: "Erro ao carregar documento", detalhe: err.message }, { status: 500 });
  }
}
