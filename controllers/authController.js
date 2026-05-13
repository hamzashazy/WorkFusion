const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  const { name, email, password, role, profile } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
      profile
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('profile.preferredCategories', 'name slug icon workMode parent');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, msg: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  const { name, profile } = req.body;

  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (profile) {
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
      if (profile.resume !== undefined) user.profile.resume = profile.resume;
      if (profile.portfolio !== undefined) user.profile.portfolio = profile.portfolio;
      if (profile.companyName !== undefined) user.profile.companyName = profile.companyName;
      if (profile.companyWebsite !== undefined) user.profile.companyWebsite = profile.companyWebsite;
      // Category preferences for job seekers
      if (profile.preferredCategories !== undefined) user.profile.preferredCategories = profile.preferredCategories;
      if (profile.preferredJobTypes !== undefined) user.profile.preferredJobTypes = profile.preferredJobTypes;
      if (user.role === 'job_seeker' && profile.projects !== undefined) {
        if (!Array.isArray(profile.projects)) {
          return res.status(400).json({ msg: 'projects must be an array' });
        }
        const cleaned = profile.projects.slice(0, 25).map((p) => {
          const title = typeof p.title === 'string' ? p.title.trim().slice(0, 200) : '';
          const o = {
            title,
            description: typeof p.description === 'string' ? p.description.trim().slice(0, 4000) : '',
            projectUrl: typeof p.projectUrl === 'string' ? p.projectUrl.trim().slice(0, 2048) : '',
            role: typeof p.role === 'string' ? p.role.trim().slice(0, 300) : '',
            skills: typeof p.skills === 'string' ? p.skills.trim().slice(0, 500) : '',
          };
          const rawId = p._id || p.id;
          if (rawId && mongoose.Types.ObjectId.isValid(String(rawId))) {
            o._id = rawId;
          }
          return o;
        }).filter((p) => p.title.length > 0);
        user.profile.projects = cleaned;
      }
    }

    await user.save();

    // Populate categories before returning
    await user.populate('profile.preferredCategories', 'name slug icon workMode parent');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

