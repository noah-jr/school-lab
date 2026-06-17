import { NextRequest } from "next/server";

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// Em memória: mapeia $"{ip}:{route}" -> RateLimitInfo
const rateLimitMap = new Map<string, RateLimitInfo>();

// Limpeza periódica automática a cada 5 minutos para evitar leaks de memória
if (typeof window === "undefined") {
  setInterval(() => {
    const agora = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (agora > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Verifica se um determinado pedido excede o rate limit.
 * 
 * @param req O pedido NextRequest
 * @param limit O limite de pedidos no período (padrão: 60)
 * @param windowMs O período em milissegundos (padrão: 60000 / 1 minuto)
 * @returns Um objecto indicando se o pedido foi bem-sucedido e os headers apropriados
 */
export function checkRateLimit(
  req: NextRequest,
  limit = 60,
  windowMs = 60000
) {
  // Obter o IP do utilizador
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip")
    || "127.0.0.1";

  // Usar o pathname da URL para rate-limiting específico por endpoint
  const route = req.nextUrl.pathname;
  const key = `${ip}:${route}`;
  const agora = Date.now();

  let info = rateLimitMap.get(key);

  if (!info || agora > info.resetAt) {
    info = {
      count: 0,
      resetAt: agora + windowMs,
    };
  }

  info.count += 1;
  rateLimitMap.set(key, info);

  const remaining = Math.max(0, limit - info.count);
  const success = info.count <= limit;

  return {
    success,
    limit,
    remaining,
    reset: Math.ceil((info.resetAt - agora) / 1000), // tempo restante em segundos
  };
}
