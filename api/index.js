const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const serverless = require('serverless-http');

// Routes
const authRoutes = require('../routes/authRoutes');
const jobRoutes = require('../routes/jobRoutes');
const applicationRoutes = require('../routes/applicationRoutes');
const categoryRoutes = require('../routes/categoryRoutes');

// Security Middleware
const { sanitizeBody } = require('../middleware/validationMiddleware');
const { 
  preventNoSQLInjection, 
  securityHeaders, 
  detectSuspiciousActivity 
} = require('../middleware/securityMiddleware');

dotenv.config();

const app = express();

// Behind Vercel / reverse proxies (needed for express-rate-limit + secure cookies)
app.set('trust proxy', 1);

// Instant responses — do not run heavy middleware (avoids 504 when / is routed here)
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

// ===== SECURITY MIDDLEWARE (Applied globally) =====

// Security headers (helmet provides many, we add custom ones)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for API responses
}));

// Custom security headers
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Body parsing with size limit
app.use(express.json({ limit: '256kb' })); // Applications may include long cover letters
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// Sanitize all inputs
app.use(sanitizeBody);

// Prevent NoSQL injection
app.use(preventNoSQLInjection);

// Detect suspicious patterns
app.use(detectSuspiciousActivity);

// ===== RATE LIMITING =====

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { 
    success: false, 
    msg: 'Too many requests, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 auth attempts per window
  message: { 
    success: false, 
    msg: 'Too many authentication attempts, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter to all routes
app.use(generalLimiter);

// ===== ROUTE MIDDLEWARES =====

// Auth routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Protected API routes
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Public routes (categories)
app.use('/api/categories', categoryRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    msg: 'Job Portal API is running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    msg: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    msg: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// MongoDB Connection
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
}

// Vercel serverless: must export the wrapped handler (not the raw Express app)
const handler = serverless(app);
module.exports = handler;

// Local Development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔒 Security middleware enabled`);
  });
}

