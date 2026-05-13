const mongoose = require('mongoose');

const JobCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
  },
  icon: {
    type: String, // Icon class or URL
  },
  // Parent category reference for hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCategory',
    default: null, // null means it's a parent category
  },
  // Work mode this category typically belongs to
  workMode: {
    type: String,
    enum: ['offline', 'online', 'hybrid'],
    default: 'offline',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
JobCategorySchema.index({ parent: 1, isActive: 1 });
JobCategorySchema.index({ slug: 1 });
JobCategorySchema.index({ workMode: 1 });

// Virtual to get children
JobCategorySchema.virtual('children', {
  ref: 'JobCategory',
  localField: '_id',
  foreignField: 'parent',
});

// Ensure virtuals are included in JSON
JobCategorySchema.set('toJSON', { virtuals: true });
JobCategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('JobCategory', JobCategorySchema);
