// email.utils.ts
import nodemailer from 'nodemailer';

interface Attachment {
  filename: string;
  content: Buffer;           // ✅ buffer بدل path
  contentType: string;
  contentDisposition?: 'attachment' | 'inline'; 
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: SendEmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    attachments, // nodemailer بيدعم content: Buffer مباشرة
  });
};