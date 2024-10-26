import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "././.env" });

const transporter = nodemailer.createTransport({
    host: "mmtp.iitk.ac.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async function sendMail(email, subject, txt, stringHTML) {
    const info = await transporter.sendMail({
      from: '"Sachida at Giva" <sachidanan22@iitk.ac.in>',
      to: email,
      subject: subject,
      text: txt,
      html: stringHTML,
    });
  
    console.log("email sent to ", email);
  }

  export { sendMail };