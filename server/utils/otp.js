const nodemailer = require('nodemailer');
const crypto = require('crypto');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"E-Voting System" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Your E-Voting OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">E-Voting System</h2>
        <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) for login is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; background: #f0f4ff; padding: 12px 24px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #555; font-size: 14px;">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOtp, sendOtpEmail };
