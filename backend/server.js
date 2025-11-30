// Load environment variables first - important for all configs
require('dotenv').config();

// Core dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Custom modules
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize the app
const app = express();

// Basic middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow frontend requests
    credentials: true // Enable cookies/auth headers
  })
);
app.use(morgan('dev')); // Logging for development

// Connect to database - this should happen after middleware
connectDB();

// API routes - keeping them organized
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Employee Attendance System API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404s
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend should be at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
