import { v4 as uuid } from "uuid";
import getDb from "./index";

// -------------------------------------------------------
// Tipos base
// -------------------------------------------------------
export interface AuditLogPayload {
  tabela: string;
  registoId: string;
  accao: "INSERT" | "UPDATE" | "DELETE" | "VIEW";
  dadosAntes?: unknown;
  dadosDepois?: unknown;
  utilizadorId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// -------------------------------------------------------
// Audit Log — INSERT-only, nunca deletar
// -------------------------------------------------------
export function criarAuditLog(payload: AuditLogPayload): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO audit_logs (id, tabela, registo_id, accao, dados_antes, dados_depois, utilizador_id, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid(),
    payload.tabela,
    payload.registoId,
    payload.accao,
    payload.dadosAntes ? JSON.stringify(payload.dadosAntes) : null,
    payload.dadosDepois ? JSON.stringify(payload.dadosDepois) : null,
    payload.utilizadorId ?? null,
    payload.ipAddress ?? null,
    payload.userAgent ?? null
  );
}

// -------------------------------------------------------
// Helper: gerador de IDs
// -------------------------------------------------------
export { uuid as gerarId };
