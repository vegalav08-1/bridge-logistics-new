import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }
});

export async function sendMail(opts: { to: string; subject: string; html: string; }) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'YP ERP <no-reply@localhost>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html
  });
}
