const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/authMiddleware');
const { employerOnly } = require('../middleware/roleMiddleware');
const { validateObjectId, validateRequired } = require('../middleware/validationMiddleware');

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (Employer only)
router.post('/', 
  auth, 
  employerOnly,
  validateRequired(['title', 'description', 'category', 'jobType', 'pricingType', 'requirements']),
  jobController.createJob
);

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', jobController.getJobs);

// @route   GET api/jobs/my
// @desc    Get employer's own jobs
// @access  Private (Employer only)
router.get('/my', auth, employerOnly, jobController.getMyJobs);

// @route   GET api/jobs/recommended
// @desc    Get recommended jobs based on user preferences
// @access  Private (Job seeker only)
const { jobSeekerOnly } = require('../middleware/roleMiddleware');
router.get('/recommended', auth, jobSeekerOnly, jobController.getRecommendedJobs);

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', validateObjectId('id'), jobController.getJob);

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private (Employer only)
router.put('/:id', 
  auth, 
  employerOnly,
  validateObjectId('id'),
  jobController.updateJob
);

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (Employer only)
router.delete('/:id', 
  auth, 
  employerOnly,
  validateObjectId('id'),
  jobController.deleteJob
);

module.exports = router;

