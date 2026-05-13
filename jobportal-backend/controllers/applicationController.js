const Application = require('../models/Application');
const Job = require('../models/Job');

const User = require('../models/User');

// Apply for a job (simplified)
exports.applyJob = async (req, res) => {
  try {
    if (req.user.role !== 'job_seeker') {
      return res.status(403).json({ msg: 'Only job seekers can apply' });
    }

    const { coverMessage, proposedRate, availability, resumeUrl, portfolioUrl, showcasedProjectIds } = req.body;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ msg: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: req.user.id });
    if (existingApplication) {
      return res.status(400).json({ msg: 'Already applied to this job' });
    }

    const applicant = await User.findById(req.user.id).select('profile.projects');
    const profileProjects = applicant?.profile?.projects || [];
    const rawIds = Array.isArray(showcasedProjectIds) ? showcasedProjectIds : [];
    const uniqIds = [...new Set(rawIds.map((x) => String(x)))].slice(0, 5);
    const showcasedProjects = [];
    for (const pid of uniqIds) {
      const p = profileProjects.find((x) => String(x._id) === pid);
      if (!p) continue;
      showcasedProjects.push({
        title: String(p.title || '').slice(0, 200),
        description: String(p.description || '').slice(0, 4000),
        projectUrl: String(p.projectUrl || '').slice(0, 2048),
        role: String(p.role || '').slice(0, 300),
        skills: String(p.skills || '').slice(0, 500),
      });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user.id,
      coverMessage,
      proposedRate:
        proposedRate !== undefined && proposedRate !== '' && !Number.isNaN(Number(proposedRate))
          ? Number(proposedRate)
          : undefined,
      availability,
      resumeUrl: typeof resumeUrl === 'string' && resumeUrl.trim() ? resumeUrl.trim().slice(0, 2048) : undefined,
      portfolioUrl: typeof portfolioUrl === 'string' && portfolioUrl.trim() ? portfolioUrl.trim().slice(0, 2048) : undefined,
      showcasedProjects,
    });

    await application.save();
    
    // Populate for response
    await application.populate([
      { path: 'job', select: 'title pricingType' },
      { path: 'applicant', select: 'name email' }
    ]);
    
    res.json({
      success: true,
      msg: 'Application submitted successfully',
      data: application
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get applications for a specific job (Employer only)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    const employerRef = job.employer;
    const employerId =
      employerRef && typeof employerRef === 'object' && employerRef._id
        ? String(employerRef._id)
        : String(employerRef);

    if (employerId !== String(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to view these applications' });
    }

    const { status, sort = 'newest' } = req.query;
    
    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const sortOptions = {
      newest: { appliedAt: -1 },
      oldest: { appliedAt: 1 },
      rateLow: { proposedRate: 1 },
      rateHigh: { proposedRate: -1 }
    };

    const applications = await Application.find(query)
      .populate('applicant', 'name email profile')
      .sort(sortOptions[sort] || sortOptions.newest);

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Update application status (Employer only)
const APPLICATION_STATUSES = [
  'applied',
  'viewed',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
];

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, employerNotes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    const jobEmployer = application.job.employer;
    const employerId =
      jobEmployer && typeof jobEmployer === 'object' && jobEmployer._id
        ? String(jobEmployer._id)
        : String(jobEmployer);

    if (employerId !== String(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    if (status && !APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    // Update fields
    if (status) application.status = status;
    if (employerNotes !== undefined) application.employerNotes = employerNotes;
    
    await application.save();

    res.json({
      success: true,
      msg: 'Application updated',
      data: application
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get my applications (Job Seeker)
exports.getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { applicant: req.user.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title location status jobType pricingType compensation employer category parentCategory',
        populate: [
          { path: 'employer', select: 'name profile.companyName' },
          { path: 'category', select: 'name slug' },
          { path: 'parentCategory', select: 'name slug' }
        ]
      })
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get single application details
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email profile')
      .populate({
        path: 'job',
        populate: [
          { path: 'employer', select: 'name email profile' },
          { path: 'category', select: 'name slug' }
        ]
      });

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === req.user.id;
    const jobEmployer = application.job.employer;
    const employerId =
      jobEmployer && typeof jobEmployer === 'object' && jobEmployer._id
        ? String(jobEmployer._id)
        : String(jobEmployer);
    const isEmployer = employerId === String(req.user.id);

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({ msg: 'Not authorized to view this application' });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Withdraw application (Job Seeker)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({ msg: 'Cannot withdraw this application' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      msg: 'Application withdrawn',
      data: application
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};
