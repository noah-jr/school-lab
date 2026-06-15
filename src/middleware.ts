import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
