import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

function ensureConfig() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM || 'no-reply@example.com';
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  }

  return { smtpHost, smtpPort, smtpUser, smtpPass, mailFrom };
}

function createTransport() {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = ensureConfig();
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendMail({ to, subject, html, text }: SendMailOptions) {
  const transport = createTransport();
  const { mailFrom } = ensureConfig();
  await transport.sendMail({
    from: mailFrom,
    to,
    subject,
    html,
    text,
  });
}

export function buildResetPasswordEmail(token: string) {
  const baseUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
  const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Restablecer contraseña';
  const html = `
    <p>Solicitaste restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace para continuar:</p>
    <p><a href="${resetLink}" target="_blank" rel="noopener">Restablecer contraseña</a></p>
    <p>Si no solicitaste este cambio, ignora este correo.</p>
  `;
  const text = `Solicitaste restablecer tu contraseña. Enlace: ${resetLink}`;
  return { subject, html, text };
}

export function buildOrderConfirmationEmail(order: any) {
  const subject = 'Confirmación de tu compra';
  const itemsHtml = order.items
    .map((item: any) => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}</li>`)
    .join('');

  const html = `
    <p>¡Gracias por tu compra!</p>
    <p>Detalle del pedido #${order._id}:</p>
    <ul>${itemsHtml}</ul>
    <p>Total: <strong>$${order.totalAmount.toLocaleString()}</strong></p>
    <p>Estado inicial: ${order.orderStatus}</p>
  `;
  const text = `Gracias por tu compra. Pedido #${order._id}. Total $${order.totalAmount}. Estado: ${order.orderStatus}`;
  return { subject, html, text };
}

export function buildOrderAdminEmail(order: any) {
  const subject = `Nueva orden #${order._id}`;
  const itemsHtml = order.items
    .map((item: any) => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}</li>`)
    .join('');

  const html = `
    <p>Nueva orden recibida</p>
    <p>Pedido #${order._id}</p>
    <p>Usuario: ${order.user?.firstName || ''} ${order.user?.lastName || ''} (${order.user?.email || 'sin email'})</p>
    <ul>${itemsHtml}</ul>
    <p>Total: <strong>$${order.totalAmount.toLocaleString()}</strong></p>
    <p>Estado: ${order.orderStatus}</p>
  `;
  const text = `Nueva orden #${order._id} Total $${order.totalAmount} Estado: ${order.orderStatus}`;
  return { subject, html, text };
}
