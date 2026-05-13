import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Briefcase, MapPin, DollarSign, FileText, CheckCircle, Layers, Clock, Settings, Plus, X, Users } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const JobPost = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    location: '',
    category: '',
    parentCategory: '',
    jobType: 'remote',
    pricingType: 'hourly',
    compensation: {
      hourly: { hourlyRate: '', estimatedHours: '', minHours: '', maxHours: '' },
      fixedPrice: { totalBudget: '', estimatedDuration: '' }
    },
    skillsRequired: [],
    experienceRequired: { minYears: 0, maxYears: '', description: '' },
    educationRequired: 'none',
    timezone: '',
    vacancies: 1
  });
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/categories/parents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle both array response and object response with categories property
        const data = res.data;
        const categoriesArray = Array.isArray(data) ? data : (data?.categories || data?.data || []);
        setCategories(categoriesArray);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when parent category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.parentCategory) {
        setSubcategories([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/categories/${formData.parentCategory}/subcategories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle both array response and object response
        const data = res.data;
        const subcategoriesArray = Array.isArray(data) ? data : (data?.subcategories || data?.categories || data?.data || []);
        setSubcategories(subcategoriesArray);
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [formData.parentCategory]);

  const handleChange = e => {
    const { name, value } = e.target;
    
    // Handle nested compensation fields
    if (name.startsWith('compensation.')) {
      const parts = name.split('.');
      const pricingType = parts[1];
      const field = parts[2];
      setFormData(prev => ({
        ...prev,
        compensation: {
          ...prev.compensation,
          [pricingType]: {
            ...prev.compensation[pricingType],
            [field]: value
          }
        }
      }));
    } else if (name.startsWith('experienceRequired.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        experienceRequired: {
          ...prev.experienceRequired,
          [field]: field.includes('Years') ? parseInt(value) || 0 : value
        }
      }));
    } else if (name === 'parentCategory') {
      setFormData(prev => ({ ...prev, [name]: value, category: '' }));
    } else if (name === 'vacancies') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, requirements: newRequirements }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired.some(s => s.skill === skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, { skill: skillInput.trim(), level: 'intermediate' }]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Filter empty requirements
      const filteredRequirements = formData.requirements.filter(r => r.trim());
      if (filteredRequirements.length === 0) {
        setError('At least one requirement is needed');
        setLoading(false);
        return;
      }

      // Build submission data
      const submitData = {
        title: formData.title,
        description: formData.description,
        requirements: filteredRequirements,
        category: formData.category || formData.parentCategory,
        parentCategory: formData.parentCategory || undefined,
        jobType: formData.jobType,
        pricingType: formData.pricingType,
        location: formData.location || undefined,
        skillsRequired: formData.skillsRequired.length > 0 ? formData.skillsRequired : undefined,
        experienceRequired: formData.experienceRequired.minYears > 0 ? formData.experienceRequired : undefined,
        educationRequired: formData.educationRequired !== 'none' ? formData.educationRequired : undefined,
        timezone: formData.timezone || undefined,
        vacancies: formData.vacancies > 0 ? formData.vacancies : 1
      };

      // Add compensation based on pricingType
      if (formData.pricingType === 'hourly') {
        const hourlyData = formData.compensation.hourly;
        const hasHourlyData = hourlyData.hourlyRate || hourlyData.estimatedHours;
        if (hasHourlyData) {
          submitData.compensation = {
            hourly: {
              hourlyRate: hourlyData.hourlyRate ? parseFloat(hourlyData.hourlyRate) : undefined,
              estimatedHours: hourlyData.estimatedHours ? parseFloat(hourlyData.estimatedHours) : undefined,
              minHours: hourlyData.minHours ? parseFloat(hourlyData.minHours) : undefined,
              maxHours: hourlyData.maxHours ? parseFloat(hourlyData.maxHours) : undefined
            }
          };
        }
      } else if (formData.pricingType === 'fixed_price') {
        const fixedData = formData.compensation.fixedPrice;
        const hasFixedData = fixedData.totalBudget || fixedData.estimatedDuration;
        if (hasFixedData) {
          submitData.compensation = {
            fixedPrice: {
              totalBudget: fixedData.totalBudget ? parseFloat(fixedData.totalBudget) : undefined,
              estimatedDuration: fixedData.estimatedDuration || undefined
            }
          };
        }
      }

      await axios.post(`${API_BASE_URL}/jobs`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('Job posted successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: [''],
        location: '',
        category: '',
        parentCategory: '',
        jobType: 'remote',
        pricingType: 'hourly',
        compensation: {
          hourly: { hourlyRate: '', estimatedHours: '', minHours: '', maxHours: '' },
          fixedPrice: { totalBudget: '', estimatedDuration: '' }
        },
        skillsRequired: [],
        experienceRequired: { minYears: 0, maxYears: '', description: '' },
        educationRequired: 'none',
        timezone: '',
        vacancies: 1
      });
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 text-base rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed";
  const selectClasses = `${inputClasses} appearance-none cursor-pointer`;

  const renderCompensationFields = () => {
    const { pricingType } = formData;
    
    if (pricingType === 'hourly') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Hourly Rate ($) <span className="text-rose-400">*</span></label>
            <input
              type="number"
              name="compensation.hourly.hourlyRate"
              value={formData.compensation.hourly.hourlyRate}
              onChange={handleChange}
              placeholder="e.g., 25"
              disabled={loading}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Estimated Hours</label>
            <input
              type="number"
              name="compensation.hourly.estimatedHours"
              value={formData.compensation.hourly.estimatedHours}
              onChange={handleChange}
              placeholder="e.g., 100"
              disabled={loading}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Min Hours (Optional)</label>
            <input
              type="number"
              name="compensation.hourly.minHours"
              value={formData.compensation.hourly.minHours}
              onChange={handleChange}
              placeholder="e.g., 10"
              disabled={loading}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Max Hours (Optional)</label>
            <input
              type="number"
              name="compensation.hourly.maxHours"
              value={formData.compensation.hourly.maxHours}
              onChange={handleChange}
              placeholder="e.g., 200"
              disabled={loading}
              className={inputClasses}
            />
          </div>
        </div>
      );
    }
    
    if (pricingType === 'fixed_price') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Total Budget ($) <span className="text-rose-400">*</span></label>
            <input
              type="number"
              name="compensation.fixedPrice.totalBudget"
              value={formData.compensation.fixedPrice.totalBudget}
              onChange={handleChange}
              placeholder="e.g., 5000"
              disabled={loading}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Estimated Duration</label>
            <input
              type="text"
              name="compensation.fixedPrice.estimatedDuration"
              value={formData.compensation.fixedPrice.estimatedDuration}
              onChange={handleChange}
              placeholder="e.g., 2 weeks"
              disabled={loading}
              className={inputClasses}
            />
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 sm:p-10 border-glow"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-xl shadow-glow">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text">
              Post a New Job
            </h2>
          </div>
          <p className="text-slate-400 text-base sm:text-lg">
            Fill out the details to create a new job posting
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-base rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-base rounded-xl"
          >
            {error}
          </motion.div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Details
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Job Title <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="e.g., Senior Software Engineer" 
                  value={formData.title}
                  onChange={handleChange} 
                  required 
                  disabled={loading}
                  className={inputClasses}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Vacancies
                  </label>
                  <input 
                    type="number" 
                    name="vacancies" 
                    placeholder="1" 
                    value={formData.vacancies}
                    onChange={handleChange} 
                    min="1"
                    disabled={loading}
                    className={inputClasses}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Timezone Preference
                  </label>
                  <input 
                    type="text" 
                    name="timezone" 
                    placeholder="e.g., EST, PST, UTC+5" 
                    value={formData.timezone}
                    onChange={handleChange} 
                    disabled={loading}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Category & Type
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleChange}
                  required
                  disabled={loading || categoriesLoading}
                  className={selectClasses}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Subcategory
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading}
                    className={selectClasses}
                  >
                    <option value="">Select a subcategory (optional)</option>
                    {subcategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Job Type <span className="text-rose-400">*</span>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={selectClasses}
                >
                  <option value="remote">Remote</option>
                  <option value="on_site">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Compensation */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing & Compensation
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Pricing Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="pricingType"
                value={formData.pricingType}
                onChange={handleChange}
                required
                disabled={loading}
                className={selectClasses}
              >
                <option value="hourly">Hourly Rate</option>
                <option value="fixed_price">Fixed Price Project</option>
              </select>
            </div>
            
            {renderCompensationFields()}
          </div>

          {/* Location Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Location {formData.jobType !== 'remote' && <span className="text-rose-400">*</span>}
              </label>
              <input 
                type="text" 
                name="location" 
                placeholder="e.g., New York, NY or Flexible" 
                value={formData.location}
                onChange={handleChange} 
                required={formData.jobType !== 'remote'}
                disabled={loading}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Skills Required
            </h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill and press Enter"
                disabled={loading}
                className={inputClasses}
              />
              <button
                type="button"
                onClick={addSkill}
                disabled={loading}
                className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {formData.skillsRequired.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
                  >
                    {skill.skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Description
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea 
                  name="description" 
                  placeholder="Describe the role, responsibilities, and what you're looking for..." 
                  value={formData.description}
                  onChange={handleChange} 
                  required 
                  disabled={loading}
                  rows="5"
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Requirements <span className="text-rose-400">*</span>
                </label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                      disabled={loading}
                      className={inputClasses}
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/30 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  disabled={loading}
                  className="mt-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Requirement
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all transform ${
              loading
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 hover:shadow-glow hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting Job...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Post Job
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default JobPost;
