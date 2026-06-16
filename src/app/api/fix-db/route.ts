import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const cols = db.pragma('table_info(utilizadores)') as any[];
    const hasCol = cols.some(c => c.name === 'precisa_mudar_senha');
    
    if (!hasCol) {
      db.exec('ALTER TABLE utilizadores ADD COLUMN precisa_mudar_senha INTEGER DEFAULT 0');
      return NextResponse.json({ success: true, message: "Coluna precisa_mudar_senha adicionada com sucesso!" });
    } else {
      return NextResponse.json({ success: true, message: "A coluna precisa_mudar_senha já existe." });
    }
  } catch (error) {
    console.error("Erro ao modificar db:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
