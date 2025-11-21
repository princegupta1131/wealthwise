/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function for Vercel
 * Handles connection pooling for serverless environment
 */

import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Global connection flag
let dbConnected = false;

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('Database connected on serverless request');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      return res.status(503).json({
        message: 'Database service unavailable. Please try again later.'
      });
    }
  }
  next();
});

// Export as default for Vercel
export default app;
