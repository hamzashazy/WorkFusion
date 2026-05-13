const Job = require('../models/Job');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ msg: 'Not authorized to post jobs' });
    }

    const {
      title,
      description,
      category,
      parentCategory,
      jobType,
      pricingType,
      compensation,
      skillsRequired,
      requirements,
      experienceRequired,
      educationRequired,
      location,
      timezone,
      status,
      vacancies,
      expiresAt,
    } = req.body;

    const newJob = new Job({
      title,
      description,
      category,
      parentCategory,
      jobType,
      pricingType,
      compensation,
      skillsRequired,
      requirements,
      experienceRequired,
      educationRequired,
      location,
      timezone,
      status,
      vacancies,
      expiresAt,
      employer: req.user.id,
    });

    const job = await newJob.save();
    
    // Populate category and employer info
    await job.populate([
      { path: 'category', select: 'name slug workMode' },
      { path: 'parentCategory', select: 'name slug' },
      { path: 'employer', select: 'name email' }
    ]);
    
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get all jobs with filters
exports.getJobs = async (req, res) => {
  try {
    const {
      category,
      jobType,
      pricingType,
      businessType,
      workMode,
      status = 'active',
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (jobType) query.jobType = jobType;
    if (pricingType) query.pricingType = pricingType;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('category', 'name slug workMode')
      .populate('parentCategory', 'name slug')
      .populate('employer', 'name email profile.companyName');
    
    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get job by ID
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('category', 'name slug workMode icon')
      .populate('parentCategory', 'name slug icon')
      .populate('employer', 'name email profile');
      
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check user
    if (job.employer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // All updatable fields
    const updatableFields = [
      'title', 'description', 'category', 'parentCategory',
      'jobType', 'pricingType', 'compensation',
      'skillsRequired', 'requirements', 'experienceRequired', 'educationRequired',
      'location', 'timezone', 'status', 'vacancies', 'expiresAt'
    ];
    
    const jobFields = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        jobFields[field] = req.body[field];
      }
    });

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: jobFields },
      { new: true }
    )
      .populate('category', 'name slug workMode')
      .populate('parentCategory', 'name slug')
      .populate('employer', 'name email');

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check user
    if (job.employer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await job.deleteOne();

    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get employer's own jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .sort({ postedAt: -1 })
      .populate('category', 'name slug workMode')
      .populate('parentCategory', 'name slug');

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get recommended jobs based on user preferences
exports.getRecommendedJobs = async (req, res) => {
  try {
    const User = require('../models/User');
    const JobCategory = require('../models/JobCategory');
    
    const { page = 1, limit = 20 } = req.query;

    // Get user with preferences
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const preferredCategories = user.profile?.preferredCategories || [];
    const preferredJobTypes = user.profile?.preferredJobTypes || [];

    // Build query
    const query = { status: 'active' };

    // If user has category preferences, find matching jobs
    if (preferredCategories.length > 0) {
      // Get all parent categories from preferred categories
      const categories = await JobCategory.find({ 
        _id: { $in: preferredCategories } 
      });

      // Collect category IDs (including children of parent categories)
      const categoryIds = [...preferredCategories];
      
      // For parent categories, also include their children
      for (const cat of categories) {
        if (!cat.parent) {
          // This is a parent category, get its children
          const children = await JobCategory.find({ parent: cat._id });
          children.forEach(child => {
            if (!categoryIds.includes(child._id)) {
              categoryIds.push(child._id);
            }
          });
        }
      }

      query.$or = [
        { category: { $in: categoryIds } },
        { parentCategory: { $in: preferredCategories } }
      ];
    }

    // Filter by job type preferences if set
    if (preferredJobTypes.length > 0) {
      query.jobType = { $in: preferredJobTypes };
    }

    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('category', 'name slug workMode')
      .populate('parentCategory', 'name slug')
      .populate('employer', 'name email profile.companyName');

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      hasPreferences: preferredCategories.length > 0 || preferredJobTypes.length > 0,
      data: jobs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};
