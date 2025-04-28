import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

var transport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // karena port 587, maka secure: false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transport;
