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
  // eslint-disable-next-line no-useless-catch
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
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 20px; }
        .content p { margin: 16px 0; color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #ec4899; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 600; }
        .footer { background: #f9fafb; padding: 24px 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Restablecer Contraseña</h1>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Solicitaste restablecer la contraseña de tu cuenta. Haz clic en el botón a continuación para crear una nueva contraseña:</p>
          <center>
            <a href="${resetLink}" class="button" target="_blank" rel="noopener">Restablecer Contraseña</a>
          </center>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px; font-size: 12px;"><code>${resetLink}</code></p>
          <div class="warning">
            <strong>⚠️ Nota:</strong> Este enlace expira en 30 minutos. Si no solicitaste restablecer tu contraseña, no hagas clic en este enlace.
          </div>
          <p>Si tuviste problemas, contacta con nuestro soporte.</p>
          <p>Saludos,<br><strong>El equipo</strong></p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
          <p>&copy; 2025 Tu Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `Solicitaste restablecer tu contraseña. Enlace: ${resetLink}\n\nEste enlace expira en 30 minutos.`;
  return { subject, html, text };
}

export function buildOrderConfirmationEmail(order: any) {
  const subject = '✅ Confirmación de tu compra';
  const itemsRowsHtml = order.items
    .map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 20px; }
        .content p { margin: 12px 0; color: #333; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 24px 0; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .footer { background: #f9fafb; padding: 24px 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ¡Compra Confirmada!</h1>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>¡Gracias por tu compra! Aquí está el resumen de tu pedido:</p>
          
          <div style="background: #f9fafb; padding: 12px 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #ec4899;">
            <strong>Pedido #${order._id}</strong> <span class="badge">${order.orderStatus}</span>
          </div>

          <h3 style="color: #1f2937; margin-top: 24px; margin-bottom: 12px;">📦 Detalles del Pedido</h3>
          <table>
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Producto</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Cantidad</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>$${order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
            </div>
            <div style="border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 8px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #ec4899;">
              <span>Total:</span>
              <span>$${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <h3 style="color: #1f2937; margin-top: 24px; margin-bottom: 12px;">📍 Información de Envío</h3>
          <p style="background: #f9fafb; padding: 16px; border-radius: 6px;">
            ${order.shippingAddress || 'Dirección de envío no especificada'}<br>
            <small style="color: #6b7280;">Recibirás un email de confirmación del envío pronto</small>
          </p>

          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
          </p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
          <p>&copy; 2025 Tu Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `¡Gracias por tu compra!\n\nPedido #${order._id}\n${order.items.map((i: any) => `${i.name} x${i.quantity} - $${(i.price * i.quantity).toLocaleString()}`).join('\n')}\n\nTotal: $${order.totalAmount.toLocaleString()}\nEstado: ${order.orderStatus}`;
  return { subject, html, text };
}

export function buildOrderAdminEmail(order: any) {
  const subject = `🚨 Nueva Orden Recibida #${order._id}`;
  const itemsRowsHtml = order.items
    .map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #dc2626; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; color: #92400e; }
        .content { padding: 40px 20px; }
        .content p { margin: 12px 0; color: #333; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .customer-info { background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 24px 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        .badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Nueva Orden Recibida</h1>
        </div>
        <div class="content">
          <div class="alert">
            <strong>⚡ Una nueva orden ha sido confirmada y requiere tu atención</strong>
          </div>

          <h2 style="color: #1f2937;">Pedido #${order._id} <span class="badge">${order.orderStatus}</span></h2>

          <div class="customer-info">
            <h3 style="margin-top: 0; margin-bottom: 12px; color: #1f2937;">👤 Cliente</h3>
            <p style="margin: 4px 0;"><strong>${order.user?.firstName || 'N/A'} ${order.user?.lastName || 'N/A'}</strong></p>
            <p style="margin: 4px 0; color: #6b7280;">${order.user?.email || 'sin email'}</p>
            ${order.user?.phone ? `<p style="margin: 4px 0; color: #6b7280;">📞 ${order.user.phone}</p>` : ''}
          </div>

          <h3 style="color: #1f2937; margin-top: 24px; margin-bottom: 12px;">📦 Productos</h3>
          <table>
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Producto</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Cantidad</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>$${order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
            </div>
            <div style="border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 8px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #dc2626;">
              <span>Total:</span>
              <span>$${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          ${order.shippingAddress ? `
            <h3 style="color: #1f2937; margin-top: 24px; margin-bottom: 12px;">📍 Dirección de Envío</h3>
            <p style="background: #f9fafb; padding: 12px; border-radius: 4px; color: #6b7280;">
              ${order.shippingAddress}
            </p>
          ` : ''}

          <p style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <strong>ℹ️ Próximos pasos:</strong> Prepara el envío y actualiza el estado de la orden en el panel administrativo.
          </p>
        </div>
        <div class="footer">
          <p>Este es un correo automático del sistema de administración.</p>
          <p>&copy; 2025 Tu Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `NUEVA ORDEN RECIBIDA\n\nPedido: #${order._id}\nCliente: ${order.user?.firstName || ''} ${order.user?.lastName || ''} (${order.user?.email || 'sin email'})\n\n${order.items.map((i: any) => `${i.name} x${i.quantity} - $${(i.price * i.quantity).toLocaleString()}`).join('\n')}\n\nTotal: $${order.totalAmount.toLocaleString()}\nEstado: ${order.orderStatus}`;
  return { subject, html, text };
}
