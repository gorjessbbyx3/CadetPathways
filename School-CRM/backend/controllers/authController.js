
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP } = require('../services/otpService');
const { createUser, findUserByEmail, storeOTP, verifyOTP } = require('../config/database');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await createUser(name, email, hashedPassword);

    res.status(201).json({ 
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await storeOTP(email, otp, expiresAt);

    console.log(`OTP for ${email}: ${otp}`); // In development, log OTP

    res.json({ 
      message: 'OTP sent to email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only send OTP in development
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(email, otp);
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // In a real application, verify the Google token here
    // For now, we'll create a mock response
    
    res.json({
      message: 'Google login successful',
      token: 'mock-jwt-token',
      user: { id: 1, name: 'Google User', email: 'user@gmail.com', role: 'student' }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login,
  verifyLogin,
  googleLogin
};
