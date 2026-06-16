import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      registarLog({
        acao: "Sessão Terminada",
        detalhe: `Utilizador (ID: ${session.id}) terminou a sessão.`,
        severidade: "info",
        utilizadorId: session.id
      });
    }
  } catch { /* silencioso */ }

  const response = NextResponse.json({ mensagem: "Logout com sucesso" });
  response.cookies.set("eac_session", "", { maxAge: 0, path: "/" });
  return response;
}

