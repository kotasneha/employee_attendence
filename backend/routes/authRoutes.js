const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// User registration endpoint
// TODO: Add email verification later
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, employeeId, department } = req.body;

    // Basic validation - could use express-validator for more robust checks
    if (!name || !email || !password || !role || !employeeId) {
      return res.status(400).json({
        message: 'All fields are required',
        required: ['name', 'email', 'password', 'role', 'employeeId']
      });
    }

    // Check for existing users - prevent duplicates
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Hash the password securely
    const saltRounds = 10; // Standard salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      department
    });

    // Generate JWT token
    const token = signToken(user);

    // Return user data (excluding password)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Registration failed:', err.message);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
});

// User login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate authentication token
    const token = signToken(user);

    // Send response with user data
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(500).json({ message: 'Login failed due to server error' });
  }
});

// Get current user profile
// Protected route - requires authentication
router.get('/me', protect, async (req, res) => {
  try {
    // User data is attached by the protect middleware
    res.json(req.user);
  } catch (err) {
    console.error('Failed to get user profile:', err.message);
    res.status(500).json({ message: 'Unable to retrieve user information' });
  }
});

module.exports = router;
