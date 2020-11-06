const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the Email Options
  const mailOptions = {
    from: 'Elemento <hello@elemento.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: 
  };

  // 3) Send the Email with Nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;