import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export interface OTP {
  id: string;
  email: string;
  codigo: string;
  proposito: string;
  expira_em: string;
  usado: number;
}

export const otpRepository = {
  gerarOTP(email: string, proposito: "recuperacao" | "registo" | "convite"): string {
    const id = uuidv4();
    // Gera um código numérico de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expira em 15 minutos
    const expiraData = new Date(Date.now() + 15 * 60 * 1000);
    const expira_em = expiraData.toISOString();

    const stmt = db.prepare(`
      INSERT INTO otps (id, email, codigo, proposito, expira_em)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, email, codigo, proposito, expira_em);

    // TODO: Num ambiente real, integraria com o Nodemailer, SendGrid, Resend, etc.
    console.log(`\n\n=== MENSAGEM DO SISTEMA ===\nEmail: ${email}\nProposito: ${proposito}\nO SEU CÓDIGO OTP É: ${codigo}\n===========================\n\n`);

    return codigo;
  },

  validarOTP(email: string, codigo: string, proposito: string): boolean {
    const stmt = db.prepare(`
      SELECT * FROM otps 
      WHERE email = ? AND codigo = ? AND proposito = ? AND usado = 0 
      ORDER BY criado_em DESC LIMIT 1
    `);
    
    const otp = stmt.get(email, codigo, proposito) as OTP | undefined;
    
    if (!otp) return false;

    if (new Date(otp.expira_em) < new Date()) {
      return false; // Expirou
    }

    // Marcar como usado
    const updateStmt = db.prepare(`UPDATE otps SET usado = 1 WHERE id = ?`);
    updateStmt.run(otp.id);

    return true;
  }
};
