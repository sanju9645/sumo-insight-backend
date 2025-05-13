import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export async function sendMail(to: string | string[], subject: string, content: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((err, success) => {
    if (err) {
      console.error(err);
    } else {
      console.log(success);
    }
  });

  const templatePath = path.join(__dirname, '../utils/email-template.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
  const htmlBody = htmlTemplate.replace('{{MAIL_CONTENT}}', content);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html: htmlBody,
    attachments: [{
      filename: 'sumo-insight-logo.png',
      path: path.join(__dirname, '../assets/images/sumo-insight-logo.png'),
      cid: 'logo' // This should match the src="cid:logo" in the HTML
    }]
  };  

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
