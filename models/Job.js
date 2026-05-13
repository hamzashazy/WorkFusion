const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  // ===== JOB CLASSIFICATION =====
  
  // Job Category - references JobCategory model (parent or child)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCategory',
    required: true,
  },

  // Parent category (auto-populated or stored for faster queries)
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCategory',
  },

  // Job Type - where the work is performed
  jobType: {
    type: String,
    enum: ['remote', 'on_site', 'hybrid'],
    required: true,
  },


  // ===== PRICING MODEL =====
  
  // Pricing Type - how the service is priced
  pricingType: {
    type: String,
    enum: ['hourly', 'fixed_price'],
    required: true,
  },

  // Compensation Details (conditional based on pricingType)
  compensation: {
    // For HOURLY pricing
    hourly: {
      hourlyRate: { type: Number },           // Rate per hour
      estimatedHours: { type: Number },       // Estimated total hours needed
      minHours: { type: Number },             // Minimum hours (optional)
      maxHours: { type: Number },             // Maximum hours (optional)
    },
    
    // For FIXED_PRICE pricing
    fixedPrice: {
      totalBudget: { type: Number },          // Fixed total project price
      estimatedDuration: { type: String },    // e.g., "2 weeks", "1 month"
    },
  },

  // ===== SKILLS & REQUIREMENTS =====
  
  // Skills required for the job
  skillsRequired: [{
    skill: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
  }],

  // Requirements (text-based)
  requirements: {
    type: [String],
    required: true,
  },

  // Experience required
  experienceRequired: {
    minYears: { type: Number, default: 0 },
    maxYears: { type: Number },
    description: { type: String },
  },

  // Education requirements
  educationRequired: {
    type: String,
    enum: ['none', 'high_school', 'associate', 'bachelor', 'master', 'phd', 'certification'],
    default: 'none',
  },

  // ===== LOCATION & LOGISTICS =====
  
  location: {
    type: String,
    required: function() {
      return this.jobType !== 'remote';
    },
  },

  // Timezone preference for remote jobs
  timezone: {
    type: String,
  },

  // ===== JOB STATUS & METADATA =====
  
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active',
  },

  // Number of openings
  vacancies: {
    type: Number,
    default: 1,
  },

  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  postedAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
  },

});

// Virtual to calculate estimated earnings
JobSchema.virtual('estimatedEarnings').get(function() {
  const { pricingType, compensation } = this;
  
  if (pricingType === 'hourly' && compensation?.hourly) {
    const { hourlyRate, estimatedHours } = compensation.hourly;
    return (hourlyRate && estimatedHours) ? (hourlyRate * estimatedHours) : null;
  }
  
  if (pricingType === 'fixed_price' && compensation?.fixedPrice) {
    return compensation.fixedPrice.totalBudget || null;
  }
  
  return null;
});

// Ensure virtuals are included in JSON output
JobSchema.set('toJSON', { virtuals: true });
JobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', JobSchema);
