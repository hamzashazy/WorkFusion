const mongoose = require('mongoose');
const JobCategory = require('../models/JobCategory');

// Helper to create slug from name
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// All categories data with parent-child structure
const categoriesData = {
  // ============ OFFLINE JOB CATEGORIES ============
  offline: [
    {
      name: 'Hospitality & Food Services',
      icon: 'fa-utensils',
      children: [
        'Waiter / Server', 'Cook / Chef', 'Kitchen Helper', 'Restaurant Manager',
        'Hotel Receptionist', 'Housekeeping Staff', 'Barista', 'Catering Staff',
        'Bakery Staff', 'Food Delivery Coordinator'
      ]
    },
    {
      name: 'Retail & Sales',
      icon: 'fa-store',
      children: [
        'Shop Salesman / Saleswoman', 'Store Manager', 'Cashier',
        'Showroom Sales Executive', 'Inventory / Stock Handler',
        'Retail Supervisor', 'Visual Merchandiser', 'Wholesale Dealer'
      ]
    },
    {
      name: 'Office & Administrative',
      icon: 'fa-building',
      children: [
        'Office Assistant', 'Receptionist', 'Office Boy', 'Data Entry Operator',
        'Clerk', 'HR Assistant', 'Admin Manager', 'Personal Secretary',
        'Front Desk Executive', 'Document Controller'
      ]
    },
    {
      name: 'IT & Software',
      icon: 'fa-desktop',
      children: [
        'Software Developer', 'Web Developer',
        'IT Support Technician', 'Network Administrator', 'System Administrator',
        'QA Tester', 'Hardware Technician', 'Database Administrator'
      ]
    },
    {
      name: 'Education & Training',
      icon: 'fa-chalkboard-teacher',
      children: [
        'School Teacher', 'College Lecturer', 'Tuition Teacher', 'Quran Teacher',
        'Lab Assistant', 'School Administrator', 'Principal', 'Librarian',
        'Sports Coach', 'Art Teacher', 'Music Teacher'
      ]
    },
    {
      name: 'Healthcare & Medical',
      icon: 'fa-heartbeat',
      children: [
        'Nurse', 'Lady Health Worker', 'Dispenser', 'Medical Assistant',
        'Lab Technician', 'Clinic Receptionist', 'Pharmacist', 'X-Ray Technician',
        'Physiotherapist', 'Dental Assistant', 'Ward Boy'
      ]
    },
    {
      name: 'Construction & Skilled Labor',
      icon: 'fa-hard-hat',
      children: [
        'Mason (Raj Mistri)', 'Construction Laborer', 'Electrician', 'Plumber',
        'Carpenter', 'Painter', 'Site Supervisor', 'Welder', 'Steel Fixer',
        'Tile Fitter', 'AC Technician', 'Solar Panel Installer'
      ]
    },
    {
      name: 'Driving & Transportation',
      icon: 'fa-truck',
      children: [
        'Car Driver', 'Delivery Rider', 'Truck Driver', 'Bus Driver',
        'Loader / Helper', 'Rickshaw Driver', 'Ambulance Driver', 'Courier Rider'
      ]
    },
    {
      name: 'Security & Safety',
      icon: 'fa-shield-alt',
      children: [
        'Security Guard', 'Security Supervisor', 'Gatekeeper',
        'CCTV Monitoring Staff', 'Armed Guard', 'Bouncer', 'Fire Safety Officer'
      ]
    },
    {
      name: 'Domestic & Household Jobs',
      icon: 'fa-home',
      children: [
        'House Maid', 'Home Cook', 'Babysitter / Nanny', 'Home Driver',
        'Elder Caregiver', 'Gardener', 'Watchman', 'Laundry Staff'
      ]
    },
    {
      name: 'Manufacturing & Factory Jobs',
      icon: 'fa-industry',
      children: [
        'Factory Worker', 'Machine Operator', 'Production Supervisor',
        'Packing Staff', 'Warehouse Worker', 'Quality Controller',
        'Forklift Operator', 'Assembly Line Worker'
      ]
    },
    {
      name: 'Beauty & Personal Care',
      icon: 'fa-spa',
      children: [
        'Beautician', 'Hair Stylist', 'Makeup Artist', 'Mehndi Artist',
        'Salon Manager', 'Spa Therapist', 'Nail Technician'
      ]
    },
    {
      name: 'Tailoring & Fashion',
      icon: 'fa-tshirt',
      children: [
        'Tailor (Darzi)', 'Master Cutter', 'Stitching Helper', 'Embroidery Worker',
        'Boutique Manager', 'Fashion Designer (On-site)'
      ]
    }
  ],

  // ============ ONLINE / REMOTE JOB CATEGORIES ============
  online: [
    {
      name: 'Software & IT',
      icon: 'fa-laptop-code',
      children: [
        'Software Developer', 'Web Developer', 'Mobile App Developer',
        'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
        'DevOps Engineer', 'Cloud Engineer', 'API Developer', 'Blockchain Developer'
      ]
    },
    {
      name: 'Design & Creative',
      icon: 'fa-palette',
      children: [
        'Graphic Designer', 'UI/UX Designer', 'Video Editor',
        'Motion Graphics Designer', 'Logo Designer', '3D Artist',
        'Illustrator', 'Brand Designer', 'Canva Designer'
      ]
    },
    {
      name: 'Digital Marketing',
      icon: 'fa-bullhorn',
      children: [
        'Social Media Manager', 'SEO Specialist', 'PPC / Ads Manager',
        'Content Marketer', 'Email Marketing Specialist', 'Influencer Manager',
        'Growth Hacker', 'Marketing Analyst', 'TikTok Manager'
      ]
    },
    {
      name: 'Writing & Content',
      icon: 'fa-pen-nib',
      children: [
        'Content Writer', 'Copywriter', 'Blog Writer', 'Technical Writer',
        'Script Writer', 'Ghostwriter', 'Translator', 'Proofreader', 'Editor'
      ]
    },
    {
      name: 'Data & Analytics',
      icon: 'fa-chart-bar',
      children: [
        'Data Analyst', 'Data Entry (Remote)', 'Business Analyst',
        'Excel Specialist', 'Power BI Developer', 'Data Scientist',
        'SQL Developer', 'Tableau Developer'
      ]
    },
    {
      name: 'Customer Support & Virtual Assistance',
      icon: 'fa-headset',
      children: [
        'Virtual Assistant', 'Chat Support Agent', 'Email Support Agent',
        'Customer Support Executive', 'Technical Support', 'Call Center Agent',
        'Live Chat Operator', 'Appointment Setter'
      ]
    },
    {
      name: 'E-Commerce & Online Business',
      icon: 'fa-shopping-cart',
      children: [
        'Amazon VA', 'Daraz Seller Manager', 'Product Listing Specialist',
        'Order Processing Assistant', 'Shopify Expert', 'eBay Seller Assistant',
        'Inventory Manager', 'E-Commerce Manager'
      ]
    },
    {
      name: 'Finance & Accounting',
      icon: 'fa-calculator',
      children: [
        'Accountant', 'Bookkeeper', 'Payroll Assistant', 'Financial Analyst',
        'Tax Consultant', 'QuickBooks Specialist', 'Auditor'
      ]
    },
    {
      name: 'Education & Training Online',
      icon: 'fa-video',
      children: [
        'Online Tutor', 'Course Instructor', 'LMS Administrator',
        'Educational Content Creator', 'IELTS Trainer', 'Language Teacher',
        'Curriculum Developer', 'Academic Writer'
      ]
    },
    {
      name: 'Transcription & Voice',
      icon: 'fa-microphone-alt',
      children: [
        'Transcriptionist', 'Voice Over Artist', 'Podcast Editor',
        'Audio Transcriber', 'Subtitler', 'Dubbing Artist'
      ]
    }
  ],

  // ============ HYBRID JOB CATEGORIES ============
  hybrid: [
    {
      name: 'Marketing & Sales',
      icon: 'fa-handshake',
      children: [
        'Marketing Executive', 'Field Sales Officer', 'Business Development Executive',
        'Relationship Manager', 'Brand Ambassador', 'Sales Coordinator',
        'Key Account Manager', 'Territory Sales Manager'
      ]
    },
    {
      name: 'Media & Communication',
      icon: 'fa-camera',
      children: [
        'Content Creator', 'Journalist', 'Photographer', 'Videographer',
        'News Reporter', 'Public Relations Officer', 'Social Media Influencer',
        'Podcast Host', 'Radio Jockey'
      ]
    },
    {
      name: 'Management & Operations',
      icon: 'fa-tasks',
      children: [
        'Project Manager', 'Operations Manager', 'Team Lead', 'Product Manager',
        'Scrum Master', 'Program Manager', 'COO', 'General Manager'
      ]
    },
    {
      name: 'Engineering & Technical Services',
      icon: 'fa-cogs',
      children: [
        'Civil Engineer', 'Electrical Engineer', 'Mechanical Engineer',
        'Site Engineer', 'Quantity Surveyor', 'AutoCAD Draftsman',
        'Quality Engineer', 'Safety Engineer'
      ]
    },
    {
      name: 'NGO & Field Work',
      icon: 'fa-hands-helping',
      children: [
        'Field Officer', 'Program Coordinator', 'Community Worker',
        'Social Worker', 'Monitoring & Evaluation Officer', 'Project Officer',
        'Fundraising Manager', 'Outreach Worker'
      ]
    },
    {
      name: 'Legal & Consulting',
      icon: 'fa-balance-scale',
      children: [
        'Lawyer', 'Legal Advisor', 'Paralegal', 'Tax Consultant',
        'Business Consultant', 'HR Consultant', 'IT Consultant'
      ]
    },
    {
      name: 'Real Estate & Property',
      icon: 'fa-city',
      children: [
        'Property Dealer', 'Real Estate Agent', 'Property Manager',
        'Leasing Agent', 'Property Advisor', 'Site Acquisition Manager'
      ]
    },
    {
      name: 'Event Management',
      icon: 'fa-calendar-alt',
      children: [
        'Event Planner', 'Wedding Coordinator', 'Stage Manager',
        'Decor Specialist', 'Catering Coordinator', 'Sound & Light Technician'
      ]
    }
  ]
};

// Seed function
const seedCategories = async () => {
  try {
    // Clear existing categories
    await JobCategory.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    let totalParents = 0;
    let totalChildren = 0;

    // Process each work mode
    for (const [workMode, categories] of Object.entries(categoriesData)) {
      let order = 0;

      for (const category of categories) {
        // Create parent category
        const parentCategory = await JobCategory.create({
          name: category.name,
          slug: createSlug(category.name),
          icon: category.icon,
          workMode: workMode,
          parent: null,
          order: order++,
        });
        totalParents++;

        // Create child categories
        let childOrder = 0;
        for (const childName of category.children) {
          await JobCategory.create({
            name: childName,
            slug: createSlug(childName) + '-' + createSlug(category.name).slice(0, 10),
            workMode: workMode,
            parent: parentCategory._id,
            order: childOrder++,
          });
          totalChildren++;
        }
      }
    }

    console.log(`✅ Seeded ${totalParents} parent categories`);
    console.log(`✅ Seeded ${totalChildren} child categories`);
    console.log(`📊 Total: ${totalParents + totalChildren} categories`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

// Run seeder
const runSeeder = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';
    await mongoose.connect(mongoURI);
    console.log('📦 Connected to MongoDB');

    await seedCategories();

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

// Export for use as module or run directly
module.exports = { seedCategories, categoriesData };

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  runSeeder();
}
