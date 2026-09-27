import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function enviarCorreoRecuperacion(destinatario, nombre, enlaceReset) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinatario,
    subject: 'Recupera tu contraseña — Il Capo della Pizza',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #cc1a22;">Il Capo della Pizza</h2>
        <p>Hola ${nombre},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva (el enlace vence en 30 minutos):</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${enlaceReset}" style="background: #cc1a22; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Restablecer contraseña
          </a>
        </p>
        <p>Si tú no solicitaste esto, puedes ignorar este correo con tranquilidad — tu contraseña actual seguirá funcionando.</p>
      </div>
    `,
  })
}
