const JobCategory = require('../models/JobCategory');

// Get all parent categories with their children
exports.getAllCategories = async (req, res) => {
  try {
    const { workMode, activeOnly = 'true' } = req.query;

    // Build query for parent categories
    const query = { parent: null };
    
    if (workMode) {
      query.workMode = workMode;
    }
    
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    // Get parent categories with populated children
    const categories = await JobCategory.find(query)
      .populate({
        path: 'children',
        match: activeOnly === 'true' ? { isActive: true } : {},
        options: { sort: { order: 1 } }
      })
      .sort({ order: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get categories grouped by work mode
exports.getCategoriesGrouped = async (req, res) => {
  try {
    const categories = await JobCategory.find({ parent: null, isActive: true })
      .populate({
        path: 'children',
        match: { isActive: true },
        options: { sort: { order: 1 } }
      })
      .sort({ order: 1 });

    // Group by work mode
    const grouped = {
      offline: categories.filter(c => c.workMode === 'offline'),
      online: categories.filter(c => c.workMode === 'online'),
      hybrid: categories.filter(c => c.workMode === 'hybrid')
    };

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Error fetching grouped categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get single category by ID or slug
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ID or slug
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await JobCategory.findById(id).populate('children');
    } else {
      category = await JobCategory.findOne({ slug: id }).populate('children');
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Get only parent categories (for dropdowns)
exports.getParentCategories = async (req, res) => {
  try {
    const { workMode } = req.query;
    
    const query = { parent: null, isActive: true };
    if (workMode) {
      query.workMode = workMode;
    }

    const categories = await JobCategory.find(query)
      .select('name slug icon workMode')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get subcategories by parent ID
exports.getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    const subcategories = await JobCategory.find({ 
      parent: parentId, 
      isActive: true 
    })
      .select('name slug')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
};

// Search categories
exports.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const categories = await JobCategory.find({
      name: { $regex: q, $options: 'i' },
      isActive: true
    })
      .populate('parent', 'name slug')
      .limit(20);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error searching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search categories',
      error: error.message
    });
  }
};
