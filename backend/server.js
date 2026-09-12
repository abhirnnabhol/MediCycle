const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const seedData = require('./utils/seedData');

// Load environment variables
dotenv.config();

const app = express();

// Security HTTP Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight IP Rate Limiter for Authentication endpoints
const authRateLimiter = (() => {
  const ipMap = new Map();
  const WINDOW_MS = 60 * 1000; // 1 minute window
  const MAX_REQUESTS = 40; // 40 requests per minute per IP

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = ipMap.get(ip);

    if (!record || now - record.startTime > WINDOW_MS) {
      record = { count: 1, startTime: now };
      ipMap.set(ip, record);
    } else {
      record.count++;
    }

    if (record.count > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Security Notice: Rate limit exceeded for authentication requests. Please try again in 1 minute.',
      });
    }

    next();
  };
})();

// API Routes
app.use('/api/auth', authRateLimiter, require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/medipoints', require('./routes/medipointsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'MediCycle Prototype API',
    timestamp: new Date().toISOString(),
    disclaimer: 'MediCycle is a hackathon prototype demonstrating responsible medicine waste reduction.',
  });
});

// 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is brand new or empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running automatic seed with fictional demo data...');
      await seedData();
    }
  } catch (seedErr) {
    console.warn('[Server] Auto-seed check notice:', seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  MediCycle Backend API running on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
