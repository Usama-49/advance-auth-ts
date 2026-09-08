import nodemailer, { Transporter } from "nodemailer";

const getTransporter = (): Transporter => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("⚠️ Warning: Missing required SMTP environment variables!");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendRegisterEmail = async (to: string, verifyUrl: string) => {
  const subject = "Verify your email address";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Welcome aboard!</h2>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
        Thanks for signing up. Please verify your email address to activate your account and get started.
      </p>
      <div style="text-align: left; margin-bottom: 24px;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; text-decoration: none; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.4; margin-bottom: 16px;">
        Or copy and paste this link into your browser:<br>
        <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;
  const transporter = getTransporter();
  return await transporter.sendMail({
    from: '"Auth App" <no-reply@myapp.com>',
    to,
    subject,
    html,
  });
};

export const sendResetPasswordEmail = async (to: string, resetUrl: string) => {
  const subject = "Reset your password";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Reset your password</h2>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
        We received a request to reset your password. Click the button below to choose a new one. This link will expire in 15 minutes.
      </p>
      <div style="text-align: left; margin-bottom: 24px;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; text-decoration: none; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.4; margin-bottom: 16px;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;
  const transporter = getTransporter();
  return await transporter.sendMail({
    from: '"Auth App" <no-reply@myapp.com>',
    to,
    subject,
    html,
  });
};
