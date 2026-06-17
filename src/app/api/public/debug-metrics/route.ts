import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    
    const countLogs = db.prepare("SELECT COUNT(*) as total FROM logs").get() as any;
    const sampleLogs = db.prepare("SELECT * FROM logs ORDER BY id DESC LIMIT 10").all() as any[];
    
    const countEstudantes = db.prepare("SELECT COUNT(*) as total FROM turma_estudantes").get() as any;
    const countTokensNull = db.prepare("SELECT COUNT(*) as total FROM turma_estudantes WHERE token_acesso IS NULL").get() as any;
    const countTokensSet = db.prepare("SELECT COUNT(*) as total FROM turma_estudantes WHERE token_acesso IS NOT NULL").get() as any;
    
    const sampleTokens = db.prepare("SELECT token_acesso FROM turma_estudantes WHERE token_acesso IS NOT NULL LIMIT 5").all() as any[];

    return NextResponse.json({
      success: true,
      logs: {
        total: countLogs?.total || 0,
        samples: sampleLogs
      },
      turma_estudantes: {
        total: countEstudantes?.total || 0,
        tokensNull: countTokensNull?.total || 0,
        tokensSet: countTokensSet?.total || 0,
        sampleTokens
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
