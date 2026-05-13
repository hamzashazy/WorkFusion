/**
 * Security Middleware
 * Additional security measures for API protection
 */

// Prevent NoSQL injection by sanitizing query operators
const preventNoSQLInjection = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove MongoDB query operators from strings
      return value.replace(/\$|\{|\}/g, '');
    }
    if (typeof value === 'object' && value !== null) {
      // Check for query operator keys
      for (const key of Object.keys(value)) {
        if (key.startsWith('$')) {
          delete value[key];
        } else {
          value[key] = sanitizeValue(value[key]);
        }
      }
    }
    return value;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

// Add security headers
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

// Request logging for security audit
const auditLog = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  };
  
  // Log to console (in production, use proper logging service)
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[AUDIT] ${logData.method} ${logData.path} - User: ${logData.userId} - IP: ${logData.ip}`);
  }
  
  next();
};

// Check for suspicious patterns in requests
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//g,           // Path traversal
    /<script/i,          // Script injection
    /javascript:/i,      // JavaScript protocol
    /on\w+\s*=/i,        // Event handlers
    /union\s+select/i,   // SQL injection
    /exec\s*\(/i,        // Code execution
  ];

  const checkValue = (value) => {
    if (typeof value !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj) => {
    if (!obj) return false;
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && checkValue(value)) {
        return true;
      }
      if (typeof value === 'object' && checkObject(value)) {
        return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    console.warn(`[SECURITY] Suspicious request blocked: ${req.method} ${req.path} from ${req.ip}`);
    return res.status(400).json({
      success: false,
      msg: 'Request contains invalid characters'
    });
  }

  next();
};

// API key validation (optional, for external API access)
const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  // Skip if API key validation is not required
  if (!process.env.REQUIRE_API_KEY) {
    return next();
  }

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      msg: 'Invalid or missing API key'
    });
  }

  next();
};

module.exports = {
  preventNoSQLInjection,
  securityHeaders,
  auditLog,
  detectSuspiciousActivity,
  validateApiKey
};
