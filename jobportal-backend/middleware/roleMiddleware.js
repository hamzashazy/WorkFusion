/**
 * Role-Based Access Control Middleware
 * Restricts routes to specific user roles
 */

// Check if user has required role(s)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        msg: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        msg: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Employer only middleware
const employerOnly = requireRole('employer');

// Job seeker only middleware
const jobSeekerOnly = requireRole('job_seeker');

// Either role (authenticated user)
const authenticated = requireRole('employer', 'job_seeker');

module.exports = {
  requireRole,
  employerOnly,
  jobSeekerOnly,
  authenticated
};
