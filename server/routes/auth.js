const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { generateOtp, sendOtpEmail } = require('../utils/otp');
const generateToken = require('../utils/generateToken');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, photo, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      photo,
      password,
    });

    const token = generateToken(user._id);

    await AuditLog.create({
      action: 'USER_REGISTERED',
      actor: user._id,
      description: `User ${user.name} registered with email ${user.email}`,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
    }

    console.log(`[DEV] OTP for ${email}: ${otp}`);

    await AuditLog.create({
      action: 'OTP_SENT',
      actor: user._id,
      description: `OTP sent to ${email}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const otpRecords = await Otp.find({ email: email.toLowerCase() }).sort({
      expiresAt: -1,
    });

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.',
      });
    }

    const otpRecord = otpRecords[0];

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user._id);

    await AuditLog.create({
      action: 'USER_LOGGED_IN',
      actor: user._id,
      description: `User ${user.email} logged in successfully`,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const lastOtp = await Otp.findOne({ email: email.toLowerCase() }).sort({
      expiresAt: -1,
    });

    if (
      lastOtp &&
      new Date() - lastOtp.expiresAt.getTime() + 10 * 60 * 1000 < 30000
    ) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 30 seconds before requesting a new OTP',
      });
    }

    await Otp.deleteMany({ email: email.toLowerCase() });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
    }

    console.log(`[DEV] OTP for ${email}: ${otp}`);

    await AuditLog.create({
      action: 'OTP_RESENT',
      actor: user._id,
      description: `OTP resent to ${email}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'OTP resent to your email',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        photo: req.user.photo,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;

    await req.user.save();

    await AuditLog.create({
      action: 'PROFILE_UPDATED',
      actor: req.user._id,
      description: `User ${req.user.email} updated their profile`,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        photo: req.user.photo,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    await Otp.deleteMany({ email: email.toLowerCase() });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
    }

    console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);

    await AuditLog.create({
      action: 'PASSWORD_RESET_OTP_SENT',
      actor: user._id,
      description: `Password reset OTP sent to ${email}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'OTP sent to your email for password reset',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() }).sort({
      expiresAt: -1,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.',
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
      });
    }

    await Otp.deleteMany({ email: email.toLowerCase() });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.password = password;
    await user.save();

    await AuditLog.create({
      action: 'PASSWORD_RESET',
      actor: user._id,
      description: `Password reset for ${email}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
