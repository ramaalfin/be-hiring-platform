// import resend from "../config/resend";
// import { EMAIL_SENDER, NODE_ENV } from "../constants/env";

// type Params = {
//   to: string;
//   subject: string;
//   text: string;
//   html: string;
// };

// const getFromEmail = () =>
//   NODE_ENV === "development" ? "onboarding@resend.dev" : EMAIL_SENDER;

// const getToEmail = (to: string) =>
//   NODE_ENV === "development" ? "delivered@resend.dev" : to;

// export const sendMail = async ({ to, subject, text, html }: Params) =>
//   await resend.emails.send({
//     from: getFromEmail(),
//     to: getToEmail(to),
//     subject,
//     text,
//     html,
//   });

import nodemailer from "nodemailer";
import {
  APP_ORIGIN,
  EMAIL_SERVICE,
  GMAIL_PASS,
  GMAIL_USER,
} from "../constants/env";

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export const sendTwoFACode = async (
  email: string,
  code: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"Your App" <${GMAIL_USER}>`,
    to: email,
    subject: "Your Two-Factor Authentication Code",
    html: `
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    `,
  });
};

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string
): Promise<void> => {
  const verificationUrl = `${APP_ORIGIN}/confirm-account?code=${verificationCode}`;

  await transporter.sendMail({
    from: `"Your App" <${GMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    html: `
      <p>Thank you for registering! Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const sendForgotPasswordEmail = async (
  email: string,
  url: string
): Promise<void> => {
  // const url = `${APP_ORIGIN}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Your App" <${GMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

export const sendMagicLoginEmail = async (email: string, url: string) => {
  await transporter.sendMail({
    from: `"GetJob" <${GMAIL_USER}>`,
    to: email,
    subject: "Masuk ke GetJob",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Masuk ke GetJob</title>
          <style>
              * { margin:0; padding:0; box-sizing:border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f5f5f5; padding:20px; }
              .email-container { max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; }
              .header { text-align:center; padding:40px 20px 30px; }
              .logo { width:150px; height:auto; margin-bottom:10px; }
              .title { font-size:32px; font-weight:600; color:#1a1a1a; margin-top:20px; }
              .divider { height:1px; background-color:#e0e0e0; margin:0 40px; }
              .content { padding:40px 40px 30px; }
              .greeting { font-size:16px; color:#333333; margin-bottom:10px; }
              .message { font-size:16px; color:#333333; line-height:1.6; margin-bottom:30px; }
              .link-text { font-weight:600; }
              .website-link { color:#0066cc; text-decoration:none; }
              .button-container { text-align:center; margin:35px 0; }
              .login-button {
                  display: inline-block;
                  background-color: #01939D;
                  color: #ffffff !important;
                  text-decoration: none;
                  padding: 14px 40px;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: 500;
                  transition: background-color 0.3s ease;
              }
              .login-button:hover { background-color:#017880; color: #ffffff !important; }
              .security-notice { font-size:13px; color:#666666; line-height:1.6; text-align:center; margin-top:25px; }
              .footer { padding:30px 40px 40px; border-top:1px solid #e0e0e0; margin-top:20px; }
              .company-name { font-size:16px; font-weight:600; color:#1a1a1a; margin-bottom:12px; }
              .address { font-size:14px; color:#666666; line-height:1.6; margin-bottom:20px; }
              .copyright { font-size:12px; color:#999999; }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <img src="https://i.imgur.com/placeholder-logo.png" alt="GetJob Logo" class="logo">
                  <h1 class="title">Masuk ke GetJob</h1>
              </div>
              
              <div class="divider"></div>
              
              <div class="content">
                  <p class="greeting">Hai,</p>
                  <p class="message">
                      Berikut adalah <span class="link-text">link masuk</span> yang kamu request dari 
                      <a href="https://www.getjob.com" class="website-link">www.getjob.com</a>
                  </p>
                  
                  <div class="button-container">
                      <a href="${url}" class="login-button">Masuk ke GetJob</a>
                  </div>
                  
                  <p class="security-notice">
                      Untuk keamanan, link hanya dapat diakses dalam 30 menit. Jika kamu tidak ada permintaan untuk login melalui link, abaikan pesan ini.
                  </p>
              </div>
              
              <div class="footer">
                  <p class="company-name">PT. GetJob Kolektif Madan</p>
                  <p class="address">
                      Menara Caraka - Jl. Mega Kuningan Barat, Kuningan, Kecamatan Setiabudi, Jakarta Selatan, DKI Jakarta 12950
                  </p>
                  <p class="copyright">© GetJob 2025. All rights reserved</p>
              </div>
          </div>
      </body>
      </html>
    `,
  });
};

export const sendMagicRegisterEmail = async (email: string, url: string) => {
  await transporter.sendMail({
    from: `"GetJob" <${GMAIL_USER}>`,
    to: email,
    subject: "Masuk ke GetJob GetJob",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Masuk ke GetJob GetJob</title>
          <style>
              * { margin:0; padding:0; box-sizing:border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f5f5f5; padding:20px; }
              .email-container { max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; }
              .header { text-align:center; padding:40px 20px 30px; }
              .logo { width:150px; height:auto; margin-bottom:10px; }
              .title { font-size:32px; font-weight:600; color:#1a1a1a; margin-top:20px; }
              .divider { height:1px; background-color:#e0e0e0; margin:0 40px; }
              .content { padding:40px 40px 30px; }
              .greeting { font-size:16px; color:#333333; margin-bottom:10px; }
              .message { font-size:16px; color:#333333; line-height:1.6; margin-bottom:30px; }
              .link-text { font-weight:600; }
              .website-link { color:#0066cc; text-decoration:none; }
              .button-container { text-align:center; margin:35px 0; }
              .login-button {
                  display: inline-block;
                  background-color: #01939D;
                  color: #ffffff !important;
                  text-decoration: none;
                  padding: 14px 40px;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: 500;
                  transition: background-color 0.3s ease;
              }
              .login-button:hover { background-color:#017880; color: #ffffff !important; }
              .security-notice { font-size:13px; color:#666666; line-height:1.6; text-align:center; margin-top:25px; }
              .footer { padding:30px 40px 40px; border-top:1px solid #e0e0e0; margin-top:20px; }
              .company-name { font-size:16px; font-weight:600; color:#1a1a1a; margin-bottom:12px; }
              .address { font-size:14px; color:#666666; line-height:1.6; margin-bottom:20px; }
              .copyright { font-size:12px; color:#999999; }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <img src="https://i.imgur.com/placeholder-logo.png" alt="GetJob Logo" class="logo">
                  <h1 class="title">Masuk ke GetJob</h1>
              </div>
              
              <div class="divider"></div>
              
              <div class="content">
                  <p class="greeting">Hai,</p>
                  <p class="message">
                      Kamu baru saja mendaftar di <a href="https://www.getjob.com" class="website-link">www.getjob.com</a>.  
                      Klik tombol di bawah untuk menyelesaikan proses pendaftaran dan masuk ke akunmu.
                  </p>
                  
                  <div class="button-container">
                      <a href="${url}" class="login-button">Masuk ke GetJob</a>
                  </div>
                  
                  <p class="security-notice">
                      Link ini hanya berlaku 30 menit. Jika kamu tidak meminta pendaftaran, abaikan pesan ini.
                  </p>
              </div>
              
              <div class="footer">
                  <p class="company-name">PT. GetJob Kolektif Madan</p>
                  <p class="address">
                      Menara Caraka - Jl. Mega Kuningan Barat, Kuningan, Kecamatan Setiabudi, Jakarta Selatan, DKI Jakarta 12950
                  </p>
                  <p class="copyright">© GetJob 2025. All rights reserved</p>
              </div>
          </div>
      </body>
      </html>
    `,
  });
};
