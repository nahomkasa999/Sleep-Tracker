import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10), 
  secure: process.env.EMAIL_SERVER_PORT === '465', 
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    ...options,
  });
}