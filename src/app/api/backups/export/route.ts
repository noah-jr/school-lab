import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DB_PATH } from "@/lib/db";
import fs from "fs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const dbPath = DB_PATH;

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ erro: "Ficheiro da base de dados não encontrado no servidor" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.sqlite3",
        "Content-Disposition": `attachment; filename="school_lab_backup_${dateStr}.sqlite"`,
      },
    });
  } catch (err) {
    console.error("[Export DB Error]", err);
    return NextResponse.json({ erro: "Erro ao exportar base de dados" }, { status: 500 });
  }
}
