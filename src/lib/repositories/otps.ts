import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { enviarEmail } from "@/lib/mail";

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

    // Enviar por e-mail real em segundo plano utilizando o serviço SMTP
    enviarEmail(
      email,
      `Código de Segurança - EAC`,
      `O seu código de verificação de uso único (OTP) para ${proposito} na Escola para Anciãos de Congregação é: ${codigo}\n\nEste código expira em 15 minutos.`
    ).catch(err => {
      console.error("[MAIL ERROR] Falha ao enviar código OTP:", err);
    });

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
