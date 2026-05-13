/**
 * Input Validation Middleware
 * Validates and sanitizes request data
 */

// Sanitize string input (basic XSS prevention)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Recursively sanitize object
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

// Sanitize request body middleware
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Validate MongoDB ObjectId format
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!id || !objectIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        msg: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

// Validate required fields in request body
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      // Handle nested fields like 'proposal.coverLetter'
      const keys = field.split('.');
      let value = req.body;
      
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        msg: `Missing required fields: ${missing.join(', ')}`
      });
    }
    
    next();
  };
};

// Validate email format
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email format'
      });
    }
  }
  next();
};

// Validate password strength
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: 'Password must be at least 6 characters'
      });
    }
  }
  next();
};

// Limit request body size (prevent large payloads)
const limitBodySize = (maxSize = 100) => {
  return (req, res, next) => {
    const bodySize = JSON.stringify(req.body).length;
    const maxBytes = maxSize * 1024; // Convert KB to bytes
    
    if (bodySize > maxBytes) {
      return res.status(413).json({
        success: false,
        msg: `Request body too large. Maximum size: ${maxSize}KB`
      });
    }
    next();
  };
};

module.exports = {
  sanitizeBody,
  sanitizeString,
  validateObjectId,
  validateRequired,
  validateEmail,
  validatePassword,
  limitBodySize
};
