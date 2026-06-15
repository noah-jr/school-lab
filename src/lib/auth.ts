import crypto from "crypto";
import { cookies } from "next/headers";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, hash] = storedHash.split(":");
  const verifyHash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return hash === verifyHash;
}

export function createSession(userId: string): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias
  const id = uuid();

  db.prepare(`
    INSERT INTO sessoes (id, utilizador_id, token, expira_em)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, token, expiresAt);

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("eac_session")?.value;
  if (!sessionToken) return null;

  try {
    const db = getDb();
    const session = db.prepare(`
      SELECT u.id, u.nome, u.email, u.papel, s.expira_em 
      FROM sessoes s
      JOIN utilizadores u ON s.utilizador_id = u.id
      WHERE s.token = ? AND u.activo = 1
    `).get(sessionToken) as any;

    if (!session) return null;

    if (new Date(session.expira_em) < new Date()) {
      db.prepare("DELETE FROM sessoes WHERE token = ?").run(sessionToken);
      return null;
    }

    return {
      id: session.id,
      nome: session.nome,
      email: session.email,
      papel: session.papel
    };
  } catch (e) {
    return null;
  }
}

