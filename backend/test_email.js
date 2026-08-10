import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Assuming run from backend/

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

const mailOptions = {
    from: process.env.SENDER_EMAIL || 'no-reply@tranquilityos.com',
    to: process.env.SENDER_EMAIL || 'no-reply@tranquilityos.com',
    subject: 'TranquilityOS Diagnostic Core',
    text: 'If you are receiving this payload, the SendGrid cryptographic relay is 100% operational!'
};

async function testEmail() {
    console.log("[DIAGNOSTIC] Transmitting over SendGrid Relay with Identity:", mailOptions.from);
    try {
        await transporter.sendMail(mailOptions);
        console.log("SYSTEM: SUCCESS! The email was successfully delivered to the SMTP server. Check Spam/Inbox.");
    } catch (err) {
        console.error("SYSTEM ERROR:", err);
    }
}

testEmail();
