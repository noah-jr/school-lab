import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "./lib/rate-limit";

// Rotas de página que requerem sessão autenticada
const ROTAS_PROTEGIDAS = [
  "/dashboard",
  "/turmas",
  "/estudantes",
  "/designacoes",
  "/relatorios",
  "/programas",
  "/configuracoes",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── 1. Proteger rotas de PÁGINA do app ──────────────────
  const rotaProtegida = ROTAS_PROTEGIDAS.some((r) => path.startsWith(r));
  if (rotaProtegida) {
    const sessionCookie = request.cookies.get("eac_session");
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 2. Proteger rotas de API (excluir auth e public) ────
  if (
    path.startsWith("/api/") &&
    !path.startsWith("/api/auth/") &&
    !path.startsWith("/api/public/")
  ) {
    const sessionCookie = request.cookies.get("eac_session");
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { erro: "Acesso não autorizado. Inicie sessão para usar a API." },
        { status: 401 }
      );
    }
  }

  // ── 3. Rate Limiting para rotas públicas da API ─────────
  if (path.startsWith("/api/public/")) {
    let limit = 60;
    if (path.startsWith("/api/public/upload")) {
      limit = 5; // Limite baixo para uploads
    } else if (path.startsWith("/api/public/feedback")) {
      limit = 10; // Limite baixo para feedbacks para evitar spam
    } else if (path.startsWith("/api/public/estudante")) {
      limit = 30; // 30 confirmações/consultas por minuto
    }

    const rateLimit = checkRateLimit(request, limit);
    if (!rateLimit.success) {
      return NextResponse.json(
        { erro: "Demasiados pedidos (Rate Limit Excedido). Por favor, tente novamente mais tarde." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/turmas/:path*",
    "/estudantes/:path*",
    "/designacoes/:path*",
    "/relatorios/:path*",
    "/programas/:path*",
    "/configuracoes/:path*",
  ],
};
