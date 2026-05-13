const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer'],
    required: true,
  },
  // Additional profile fields can be added here
  profile: {
    bio: String,
    resume: String, // Link to resume
    portfolio: String, // Portfolio / personal site (job seekers)
    /** Upwork-style portfolio pieces (job seekers). */
    projects: [{
      title: { type: String, required: true, maxlength: 200, trim: true },
      description: { type: String, maxlength: 4000, default: '' },
      projectUrl: { type: String, maxlength: 2048, default: '' },
      role: { type: String, maxlength: 300, default: '' }, // Your role on the project
      skills: { type: String, maxlength: 500, default: '' }, // Skills / tools (comma-separated)
    }],
    companyName: String, // For employers
    companyWebsite: String, // For employers
    // Job seeker preferences for personalized recommendations
    preferredCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobCategory'
    }],
    preferredJobTypes: [{
      type: String,
      enum: ['remote', 'on_site', 'hybrid']
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
