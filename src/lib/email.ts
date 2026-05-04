// ─── KINGNECT — Email Service (Resend) ──────────────────────────────────────────
// Envío de emails transaccionales usando Resend
// Si Resend no está configurado, los emails se loguean en consola (dev mode)

import { Resend } from "resend"

// ─── Inicialización de Resend ──────────────────────────────────────────────────

let resendInstance: Resend | null = null

function getResend(): Resend | null {
  if (resendInstance) return resendInstance

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.includes("placeholder")) {
    console.warn("⚠️ Resend no configurado: RESEND_API_KEY no encontrada o es placeholder")
    return null
  }

  resendInstance = new Resend(apiKey)
  return resendInstance
}

export function isEmailConfigured(): boolean {
  return getResend() !== null
}

// ─── Enviar Email de Recuperación de Contraseña ────────────────────────────────

interface SendPasswordResetParams {
  to: string
  resetUrl: string
  businessName?: string
}

export async function sendPasswordResetEmail({ to, resetUrl, businessName }: SendPasswordResetParams) {
  const resend = getResend()
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Kingnect"

  if (!resend) {
    // Modo desarrollo: loguear el enlace
    console.log(`📧 [DEV] Password reset email para ${to}:`)
    console.log(`   Reset URL: ${resetUrl}`)
    return { success: true, mode: "dev" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to,
      subject: `Restablece tu contraseña — ${appName}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Restablecer contraseña</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .logo { text-align: center; margin-bottom: 32px; }
            .logo h1 { color: #D4A849; font-size: 24px; margin: 0; font-weight: 700; }
            .logo p { color: #6b7280; font-size: 14px; margin: 4px 0 0; }
            h2 { color: #111827; font-size: 20px; margin: 0 0 16px; }
            p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
            .button { display: inline-block; background: #D4A849; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
            .footer { text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px; }
            .footer a { color: #D4A849; text-decoration: none; }
            .code-box { background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
            .code-box small { color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <h1>${appName}</h1>
                <p>Tu negocio en un Kinec profesional</p>
              </div>
              <h2>Restablecer tu contraseña</h2>
              <p>Hola${businessName ? ` ${businessName}` : ""},</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer contraseña</a>
              </div>
              <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo la misma.</p>
              <div class="code-box">
                <small>Este enlace expira en 1 hora por seguridad.</small>
              </div>
              <p style="font-size: 13px; color: #6b7280;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="word-break: break-all; color: #D4A849;">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${appName} by King Designs. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error enviando email de reset:", error)
      return { success: false, error: error.message }
    }

    return { success: true, mode: "production", emailId: data?.id }
  } catch (error) {
    console.error("Error enviando email de reset:", error)
    return { success: false, error: String(error) }
  }
}

// ─── Enviar Email de Bienvenida ────────────────────────────────────────────────

interface SendWelcomeParams {
  to: string
  businessName: string
  loginUrl: string
}

export async function sendWelcomeEmail({ to, businessName, loginUrl }: SendWelcomeParams) {
  const resend = getResend()
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Kingnect"

  if (!resend) {
    console.log(`📧 [DEV] Welcome email para ${to}`)
    return { success: true, mode: "dev" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to,
      subject: `¡Bienvenido a ${appName}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .logo { text-align: center; margin-bottom: 32px; }
            .logo h1 { color: #D4A849; font-size: 24px; margin: 0; font-weight: 700; }
            h2 { color: #111827; font-size: 20px; margin: 0 0 16px; }
            p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
            .button { display: inline-block; background: #D4A849; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; }
            .footer { text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px; }
            ul { padding-left: 20px; }
            li { color: #374151; font-size: 15px; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <h1>${appName}</h1>
              </div>
              <h2>¡Bienvenido, ${businessName}! 🎉</h2>
              <p>Tu cuenta ha sido creada exitosamente. Ya puedes empezar a configurar tu Kinec profesional con QR.</p>
              <p>Esto es lo que puedes hacer:</p>
              <ul>
                <li>Personalizar el diseño de tu Kinec</li>
                <li>Agregar tus redes sociales y WhatsApp</li>
                <li>Subir tu catálogo o menú</li>
                <li>Descargar tu código QR</li>
              </ul>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${loginUrl}" class="button">Entrar a mi dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${appName} by King Designs</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error enviando welcome email:", error)
      return { success: false, error: error.message }
    }

    return { success: true, mode: "production", emailId: data?.id }
  } catch (error) {
    console.error("Error enviando welcome email:", error)
    return { success: false, error: String(error) }
  }
}
