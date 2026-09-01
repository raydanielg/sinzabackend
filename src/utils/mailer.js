import nodemailer from "nodemailer"
import { config } from "../config/env.js"
import { logger } from "../config/logger.js"

let transporter = null

function getTransporter() {
  if (!transporter && config.smtpHost) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    })
  }
  return transporter
}

export async function sendOtpEmail(email, otp) {
  const t = getTransporter()
  if (!t) {
    logger.info(`[Email skipped] OTP for ${email}: ${otp}`)
    return
  }
  await t.sendMail({
    from: config.smtpFrom,
    to: email,
    subject: "Sinza Fashion - Password Reset OTP",
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`,
  })
}
