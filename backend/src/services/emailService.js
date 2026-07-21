import nodemailer from 'nodemailer'
import { ENV } from '../config/env.js'
import { supabase } from '../config/supabase.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS.replace(/\s+/g, ''),
  },
})

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded',
}

export async function sendOtpEmail(to, code, purpose) {
  const isRegister = purpose === 'register'
  const subject = isRegister
    ? 'Verify your email — Drape Studio'
    : 'Your login code — Drape Studio'

  const headline = isRegister ? 'Verify your email' : 'Confirm your login'
  const bodyText = isRegister
    ? "Enter this code to finish creating your Drape Studio account."
    : "Enter this code to complete signing in to your account."

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background-color:#F4F4F5; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E4E4E7;">

            <!-- Header band -->
            <tr>
              <td style="background-color:#0F0F0F; padding: 28px 40px; text-align: center;">
                <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #FFFFFF; letter-spacing: 3px;">DRAPE</span>
                <br />
                <span style="font-family: Arial, sans-serif; font-size: 10px; color: #C9A96E; letter-spacing: 4px;">STUDIO</span>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px 40px 32px 40px;">
                <p style="font-family: Georgia, serif; font-size: 20px; color: #0F0F0F; margin: 0 0 12px 0;">
                  ${headline}
                </p>
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #52525B; line-height: 1.6; margin: 0 0 28px 0;">
                  ${bodyText}
                </p>

                <!-- OTP box -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:#FAFAFA; border: 1px solid #E4E4E7; border-radius: 8px; padding: 24px;">
                      <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #0F0F0F;">
                        ${code}
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="font-family: Arial, sans-serif; font-size: 12px; color: #A1A1AA; line-height: 1.6; margin: 24px 0 0 0;">
                  This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#FAFAFA; padding: 20px 40px; text-align: center; border-top: 1px solid #F4F4F5;">
                <p style="font-family: Arial, sans-serif; font-size: 11px; color: #A1A1AA; margin: 0;">
                  Drape Studio · Mumbai · Conscious clothing, crafted slow
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `

  await transporter.sendMail({
    from: `"Drape Studio" <${ENV.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

function emailShell(bodyHtml) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background-color:#F4F4F5; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E4E4E7;">
            <tr>
              <td style="background-color:#0F0F0F; padding: 28px 40px; text-align: center;">
                <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #FFFFFF; letter-spacing: 3px;">DRAPE</span>
                <br />
                <span style="font-family: Arial, sans-serif; font-size: 10px; color: #C9A96E; letter-spacing: 4px;">STUDIO</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background-color:#FAFAFA; padding: 20px 40px; text-align: center; border-top: 1px solid #F4F4F5;">
                <p style="font-family: Arial, sans-serif; font-size: 11px; color: #A1A1AA; margin: 0;">
                  Drape Studio · Mumbai · Conscious clothing, crafted slow
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

async function getUserEmail(userId) {
  if (!userId) return null
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error || !data?.user) return null
    return data.user.email
  } catch {
    return null
  }
}

export async function sendOrderConfirmationEmail(order) {
  const email = await getUserEmail(order.user_id)
  if (!email) return

  const itemsHtml = (order.order_items || []).map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F4F4F5; font-family: Arial, sans-serif; font-size: 13px; color: #0F0F0F;">
        ${item.snapshot?.product_name || 'Item'}<br/>
        <span style="color: #A1A1AA; font-size: 12px;">${item.snapshot?.colour || ''} · ${item.snapshot?.size || ''} · Qty ${item.quantity}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F4F4F5; font-family: Arial, sans-serif; font-size: 13px; color: #0F0F0F; text-align: right;">
        ₹${Number(item.unit_price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('')

  const addr = order.order_addresses?.[0]

  const body = `
    <p style="font-family: Georgia, serif; font-size: 20px; color: #0F0F0F; margin: 0 0 6px 0;">Order confirmed</p>
    <p style="font-family: Arial, sans-serif; font-size: 13px; color: #A1A1AA; margin: 0 0 24px 0;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
      <tr>
        <td style="padding-top: 12px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #0F0F0F;">Total</td>
        <td style="padding-top: 12px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #0F0F0F; text-align: right;">₹${Number(order.total).toLocaleString('en-IN')}</td>
      </tr>
    </table>
    ${addr ? `
    <p style="font-family: Arial, sans-serif; font-size: 12px; color: #A1A1AA; margin: 24px 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Delivering to</p>
    <p style="font-family: Arial, sans-serif; font-size: 13px; color: #0F0F0F; line-height: 1.6; margin: 0;">
      ${addr.name}<br/>${addr.line1}${addr.line2 ? '<br/>' + addr.line2 : ''}<br/>${addr.city}, ${addr.state} — ${addr.pincode}
    </p>` : ''}
  `

  await transporter.sendMail({
    from: `"Drape Studio" <${ENV.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
    html: emailShell(body),
  })
}

export async function sendOrderStatusEmail(order, oldStatus, newStatus, note) {
  const email = await getUserEmail(order.user_id)
  if (!email) return

  const body = `
    <p style="font-family: Georgia, serif; font-size: 20px; color: #0F0F0F; margin: 0 0 6px 0;">Order ${STATUS_LABELS[newStatus] || newStatus}</p>
    <p style="font-family: Arial, sans-serif; font-size: 13px; color: #A1A1AA; margin: 0 0 24px 0;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
    <p style="font-family: Arial, sans-serif; font-size: 14px; color: #52525B; line-height: 1.6; margin: 0 0 12px 0;">
      Your order status changed from <strong>${STATUS_LABELS[oldStatus] || oldStatus}</strong> to <strong>${STATUS_LABELS[newStatus] || newStatus}</strong>.
    </p>
    ${note ? `<p style="font-family: Arial, sans-serif; font-size: 13px; color: #A1A1AA; margin: 0 0 12px 0;">Note: ${note}</p>` : ''}
    <a href="${ENV.FRONTEND_URL}/orders/${order.id}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background-color: #0F0F0F; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 13px; text-decoration: none; border-radius: 6px;">
      View Order
    </a>
  `

  await transporter.sendMail({
    from: `"Drape Studio" <${ENV.SMTP_USER}>`,
    to: email,
    subject: `Order ${STATUS_LABELS[newStatus] || newStatus} — #${order.id.slice(0, 8).toUpperCase()}`,
    html: emailShell(body),
  })
}