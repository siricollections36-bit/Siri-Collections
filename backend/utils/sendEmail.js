const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465
    auth: {
      user: process.env.EMAIL_USER, // siricollections36@gmail.com
      pass: process.env.EMAIL_PASS, // The 16-character App Password
    },
  });

  const mailOptions = {
    from: `"Siri Textiles" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, // Use HTML for a professional look
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;