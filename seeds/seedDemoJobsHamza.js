/**
 * Seed demo jobs for employer hamza@gmail.com
 * Usage (from jobportal-backend): node seeds/seedDemoJobsHamza.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const JobCategory = require('../models/JobCategory');

const EMPLOYER_EMAIL = 'hamza@gmail.com';

async function pickCategories() {
  let parent =
    (await JobCategory.findOne({ parent: null, slug: 'software-it' })) ||
    (await JobCategory.findOne({ parent: null, workMode: 'online' })) ||
    (await JobCategory.findOne({ parent: null }));

  if (!parent) {
    throw new Error('No job categories in database. Run: npm run seed:categories');
  }

  const child =
    (await JobCategory.findOne({ parent: parent._id, isActive: true }).sort({ order: 1 })) ||
    parent;

  return { parent, child };
}

function jobsPayload(employerId, parentId, categoryId) {
  return [
    {
      title: 'Senior React Developer',
      description:
        'Build and maintain customer-facing dashboards with React and TypeScript. Collaborate with design and API teams, ship features, and improve performance.',
      category: categoryId,
      parentCategory: parentId,
      jobType: 'remote',
      pricingType: 'hourly',
      compensation: { hourly: { hourlyRate: 55, estimatedHours: 160 } },
      skillsRequired: [
        { skill: 'React', level: 'expert' },
        { skill: 'TypeScript', level: 'advanced' },
        { skill: 'REST APIs', level: 'intermediate' },
      ],
      requirements: ['5+ years React', 'Strong TypeScript', 'Experience with CI/CD'],
      experienceRequired: { minYears: 5, maxYears: 12 },
      educationRequired: 'bachelor',
      timezone: 'GMT+5',
      status: 'active',
      vacancies: 2,
      employer: employerId,
    },
    {
      title: 'Node.js Backend Engineer',
      description:
        'Design and implement REST APIs, integrate MongoDB, and help scale our e-commerce platform. Code reviews and documentation expected.',
      category: categoryId,
      parentCategory: parentId,
      jobType: 'remote',
      pricingType: 'hourly',
      compensation: { hourly: { hourlyRate: 48, estimatedHours: 200 } },
      skillsRequired: [
        { skill: 'Node.js', level: 'advanced' },
        { skill: 'MongoDB', level: 'advanced' },
        { skill: 'Express', level: 'intermediate' },
      ],
      requirements: ['4+ years Node.js', 'MongoDB experience', 'Docker basics'],
      experienceRequired: { minYears: 4, maxYears: 10 },
      educationRequired: 'bachelor',
      timezone: 'Any',
      status: 'active',
      vacancies: 1,
      employer: employerId,
    },
    {
      title: 'UI/UX Designer (SaaS)',
      description:
        'Redesign our B2B SaaS flows in Figma, run light user research, and hand off specs to engineering. Strong portfolio required.',
      category: categoryId,
      parentCategory: parentId,
      jobType: 'hybrid',
      pricingType: 'fixed_price',
      compensation: { fixedPrice: { totalBudget: 8500, estimatedDuration: '8 weeks' } },
      skillsRequired: [
        { skill: 'Figma', level: 'expert' },
        { skill: 'Prototyping', level: 'advanced' },
      ],
      requirements: ['Portfolio with SaaS projects', 'Design systems experience'],
      experienceRequired: { minYears: 3, maxYears: 8 },
      location: 'Karachi, PK',
      timezone: 'GMT+5',
      status: 'active',
      vacancies: 1,
      employer: employerId,
    },
    {
      title: 'DevOps Engineer (AWS)',
      description:
        'Own CI/CD, Terraform modules, and observability for our AWS workloads. On-call rotation shared with the team.',
      category: categoryId,
      parentCategory: parentId,
      jobType: 'remote',
      pricingType: 'hourly',
      compensation: { hourly: { hourlyRate: 72, estimatedHours: 120 } },
      skillsRequired: [
        { skill: 'AWS', level: 'expert' },
        { skill: 'Terraform', level: 'advanced' },
        { skill: 'Kubernetes', level: 'intermediate' },
      ],
      requirements: ['5+ years DevOps', 'IaC experience', 'Monitoring & alerting'],
      experienceRequired: { minYears: 5, maxYears: 15 },
      educationRequired: 'bachelor',
      timezone: 'US/Eastern overlap 4h',
      status: 'active',
      vacancies: 1,
      employer: employerId,
    },
    {
      title: 'Full-Stack Engineer (MERN)',
      description:
        'Ship end-to-end features across React admin and Node services. Comfortable owning tickets from spec to production.',
      category: categoryId,
      parentCategory: parentId,
      jobType: 'hybrid',
      pricingType: 'hourly',
      compensation: { hourly: { hourlyRate: 42, estimatedHours: 180 } },
      skillsRequired: [
        { skill: 'React', level: 'advanced' },
        { skill: 'Node.js', level: 'advanced' },
        { skill: 'MongoDB', level: 'intermediate' },
      ],
      requirements: ['3+ years MERN', 'Git workflow', 'Clear written communication'],
      experienceRequired: { minYears: 3, maxYears: 8 },
      location: 'Lahore, PK',
      timezone: 'GMT+5',
      status: 'active',
      vacancies: 3,
      employer: employerId,
    },
    {
      title: 'Mobile App (Flutter) — Fixed scope',
      description:
        'Deliver a production-ready Flutter module for offline forms and sync. Milestones and weekly demos.',
      category: categoryId,
      parentCategory: parentId,
      jobType: 'remote',
      pricingType: 'fixed_price',
      compensation: { fixedPrice: { totalBudget: 14000, estimatedDuration: '3 months' } },
      skillsRequired: [
        { skill: 'Flutter', level: 'advanced' },
        { skill: 'Dart', level: 'advanced' },
      ],
      requirements: ['Published apps', 'State management experience', 'REST integration'],
      experienceRequired: { minYears: 2, maxYears: 6 },
      timezone: 'Flexible',
      status: 'active',
      vacancies: 1,
      employer: employerId,
    },
  ];
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email: EMPLOYER_EMAIL.toLowerCase() });
  if (!user) {
    console.error(
      `No user found with email ${EMPLOYER_EMAIL}. Register as employer in the panel first.`
    );
    process.exit(1);
  }
  if (user.role !== 'employer') {
    console.error(`User ${EMPLOYER_EMAIL} exists but role is "${user.role}", not employer.`);
    process.exit(1);
  }

  const { parent, child } = await pickCategories();
  console.log(`Using category: ${child.name} (parent: ${parent.name})`);

  const docs = jobsPayload(user._id, parent._id, child._id);
  const inserted = await Job.insertMany(docs);

  console.log(`Inserted ${inserted.length} demo jobs for ${EMPLOYER_EMAIL} (${user.name})`);
  inserted.forEach((j) => console.log(`  - ${j.title} (${j._id})`));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
