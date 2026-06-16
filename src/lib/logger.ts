import getDb from "@/lib/db";

type Severidade = "info" | "success" | "warning" | "error";

interface LogPayload {
  acao: string;
  detalhe: string;
  severidade?: Severidade;
  utilizadorId?: string | null;
}

/**
 * Regista um evento no sistema de logs.
 * Cria a tabela automaticamente se não existir.
 */
export function registarLog(payload: LogPayload): void {
  try {
    const db = getDb();

    // Garantir que a tabela existe
    db.prepare(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilizador_id TEXT,
        acao TEXT NOT NULL,
        detalhe TEXT NOT NULL,
        severidade TEXT NOT NULL DEFAULT 'info',
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
      )
    `).run();

    db.prepare(`
      INSERT INTO logs (utilizador_id, acao, detalhe, severidade)
      VALUES (?, ?, ?, ?)
    `).run(
      payload.utilizadorId ?? null,
      payload.acao,
      payload.detalhe,
      payload.severidade ?? "info"
    );
  } catch (err) {
    // Nunca deixar o log crashar o fluxo principal
    console.error("[registarLog] Erro silencioso:", err);
  }
}
