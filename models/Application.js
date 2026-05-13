const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // ===== SIMPLE APPLICATION FIELDS =====
  
  // Brief message / Why you're interested (optional, keeps it easy)
  coverMessage: {
    type: String,
    maxlength: 8000,
  },

  /** Link to resume/CV for this application (overrides applicant profile link when set). */
  resumeUrl: {
    type: String,
    maxlength: 2048,
  },

  /** Portfolio or personal site link. */
  portfolioUrl: {
    type: String,
    maxlength: 2048,
  },

  /** Snapshot of profile projects the applicant chose to highlight (max 5 at apply time). */
  showcasedProjects: [{
    title: { type: String, maxlength: 200 },
    description: { type: String, maxlength: 4000 },
    projectUrl: { type: String, maxlength: 2048 },
    role: { type: String, maxlength: 300 },
    skills: { type: String, maxlength: 500 },
  }],

  // Proposed rate or price (based on job's pricingType)
  proposedRate: {
    type: Number,
  },

  // When can you start?
  availability: {
    type: String,
    enum: ['immediately', 'within_week', 'within_2_weeks', 'flexible'],
    default: 'flexible',
  },

  // ===== APPLICATION STATUS =====
  
  status: {
    type: String,
    enum: [
      'applied',      // Just submitted
      'viewed',       // Employer opened the application
      'shortlisted',  // Added to shortlist
      'interview',    // Interview scheduled
      'offer',        // Offer extended
      'hired',        // Hired for the job
      'rejected',     // Not selected
      'withdrawn',    // Applicant withdrew
    ],
    default: 'applied',
  },

  // Employer's private notes (optional)
  employerNotes: {
    type: String,
  },

  // ===== TIMESTAMPS =====
  
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  viewedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
ApplicationSchema.index({ applicant: 1, status: 1 });
ApplicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
