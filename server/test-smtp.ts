import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // load .env

async function testSMTP() {
  console.log("SMTP Host:", process.env.SMTP_HOST);
  console.log("SMTP Port:", process.env.SMTP_PORT);
  console.log("SMTP User:", process.env.SMTP_USER);

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // brevo smtp pakai TLS, jadi secure: false untuk port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("🚀 Starting SMTP verification...");
  try {
    await transport.verify();
    console.log("✅ SMTP connection successful!");
    await transport.sendMail({
      from: "Haryo Darma <haryo.darmap@gmail.com>", // Harus email yang diverifikasi di Brevo
      to: "haryo.darmap@gmail.com",
      subject: "Hello from Brevo!",
      text: "This is a test email sent using Nodemailer + Brevo SMTP.",
      html: "<h1>Hello!</h1><p>This is a <b>test email</b> from Node.js</p>",
    });
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
  }
}

testSMTP();
