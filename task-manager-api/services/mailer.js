const nodemailer = require('nodemailer');

const hasMailConfig = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.MAIL_FROM
);

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

const sendEmail = async ({ to, subject, text }) => {
  if (!transporter) {
    console.warn(`Email skipped for ${to}: SMTP is not configured.`);
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text
  });
  return true;
};

module.exports = { sendEmail };
