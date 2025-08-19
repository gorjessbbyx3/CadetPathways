
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, verifyOTP } = require('../services/otpService');

// In-memory user storage (replace with database in production)
const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$8K0p.qJX0xJ8j0fxRJ8jy.XhX2Q7nJo2k1z2X3YqF4G5H6I7J8K9L',
    role: 'student'
  }
];

const tempOTPs = new Map();

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: 'student'
    };

    users.push(newUser);

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
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
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    tempOTPs.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 minutes

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
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const otpData = tempOTPs.get(email);
    if (!otpData || otpData.expires < Date.now()) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Remove used OTP
    tempOTPs.delete(email);

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
