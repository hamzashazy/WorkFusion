const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/authMiddleware');
const { employerOnly, jobSeekerOnly } = require('../middleware/roleMiddleware');
const { validateObjectId, validateRequired } = require('../middleware/validationMiddleware');

// @route   POST api/applications/:jobId
// @desc    Apply for a job with proposal
// @access  Private (Job Seeker only)
router.post('/:jobId', 
  auth, 
  jobSeekerOnly,
  validateObjectId('jobId'),
  applicationController.applyJob
);

// @route   GET api/applications/my
// @desc    Get my applications
// @access  Private (Job Seeker only)
router.get('/my', auth, jobSeekerOnly, applicationController.getMyApplications);

// @route   GET api/applications/job/:jobId
// @desc    Get applications for a job
// @access  Private (Employer only)
router.get('/job/:jobId', 
  auth, 
  employerOnly,
  validateObjectId('jobId'),
  applicationController.getJobApplications
);

// @route   GET api/applications/:id
// @desc    Get single application details
// @access  Private (Applicant or Employer - checked in controller)
router.get('/:id', 
  auth, 
  validateObjectId('id'),
  applicationController.getApplication
);

// @route   PUT api/applications/:id/status
// @desc    Update application status, notes, rating
// @access  Private (Employer only)
router.put('/:id/status', 
  auth, 
  employerOnly,
  validateObjectId('id'),
  applicationController.updateApplicationStatus
);

// @route   PUT api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Job Seeker only)
router.put('/:id/withdraw', 
  auth, 
  jobSeekerOnly,
  validateObjectId('id'),
  applicationController.withdrawApplication
);

module.exports = router;


