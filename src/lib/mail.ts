import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || `"Escola para Anciãos de Congregação" <${user}>`;

export async function enviarEmail(para: string, assunto: string, texto: string, html?: string) {
  if (!user || !pass) {
    console.warn("[MAIL] SMTP_USER ou SMTP_PASS não configurados no ficheiro .env. O email não foi enviado para a rede, apenas impresso na consola:");
    console.log(`\n========================================\n[MOCK EMAIL]\nPara: ${para}\nAssunto: ${assunto}\nConteúdo:\n${texto}\n========================================\n`);
    return { mock: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: para,
    subject: assunto,
    text: texto,
    html: html || texto.replace(/\n/g, "<br>"),
  });

  console.log("[MAIL] Email enviado com sucesso:", info.messageId);
  return info;
}
