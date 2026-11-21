import nodemailer from "nodemailer";

// SMTP_URL e.g. smtps://user:pass@mail.example.org:465
const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

export async function sendMail(to: string, subject: string, text: string) {
  if (!transport) {
    // shortcut: without SMTP_URL mails only go to the server log; set SMTP_URL before going live
    console.info(`[mail] to=${to} subject=${subject}\n${text}`);
    return;
  }
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}

/** Public base URL for links in mails. */
export const appUrl = (path: string) => new URL(path, process.env.BETTER_AUTH_URL ?? "http://localhost:3000").toString();
