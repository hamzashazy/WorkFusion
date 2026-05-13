import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Edit2, Save, X, Trash2, MapPin, DollarSign, Briefcase, FileText, CheckCircle, Users, Globe, Clock, Layers, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const JobDetail = ({ job: jobProp, jobId, onBack, onJobUpdated, onJobDeleted, onViewApplications }) => {
  const [job, setJob] = useState(jobProp);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!jobProp && jobId);
  // eslint-disable-next-line no-unused-vars
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    location: '',
    jobType: 'remote',
    pricingType: 'hourly',
    compensation: {
      hourly: { hourlyRate: '', estimatedHours: '', minHours: '', maxHours: '' },
      fixedPrice: { totalBudget: '', estimatedDuration: '' }
    },
    status: 'active',
    timezone: '',
    vacancies: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle both array response and object response with categories property
        const data = res.data;
        const categoriesArray = Array.isArray(data) ? data : (data?.categories || data?.data || []);
        setCategories(categoriesArray);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch job if accessed via URL with jobId
  useEffect(() => {
    if (!jobProp && jobId) {
      const fetchJob = async () => {
        try {
          setFetchLoading(true);
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setJob(res.data);
        } catch (err) {
          setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to load job');
        } finally {
          setFetchLoading(false);
        }
      };
      fetchJob();
    } else if (jobProp) {
      setJob(jobProp);
    }
  }, [jobProp, jobId]);

  useEffect(() => {
    if (job) {
      // Handle requirements - could be string or array
      let requirements = [''];
      if (Array.isArray(job.requirements)) {
        requirements = job.requirements.length > 0 ? job.requirements : [''];
      } else if (typeof job.requirements === 'string' && job.requirements) {
        requirements = [job.requirements];
      }
      
      // Build compensation from job data
      const compensation = {
        hourly: { hourlyRate: '', estimatedHours: '', minHours: '', maxHours: '' },
        fixedPrice: { totalBudget: '', estimatedDuration: '' }
      };
      
      if (job.compensation) {
        if (job.compensation.hourly) {
          compensation.hourly = {
            hourlyRate: job.compensation.hourly.hourlyRate || '',
            estimatedHours: job.compensation.hourly.estimatedHours || '',
            minHours: job.compensation.hourly.minHours || '',
            maxHours: job.compensation.hourly.maxHours || ''
          };
        }
        if (job.compensation.fixedPrice) {
          compensation.fixedPrice = {
            totalBudget: job.compensation.fixedPrice.totalBudget || '',
            estimatedDuration: job.compensation.fixedPrice.estimatedDuration || ''
          };
        }
      }
      
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements,
        location: job.location || '',
        jobType: job.jobType || 'remote',
        pricingType: job.pricingType || 'hourly',
        compensation,
        status: job.status || 'active',
        timezone: job.timezone || '',
        vacancies: job.vacancies || 1
      });
    }
  }, [job]);

  const handleChange = e => {
    const { name, value } = e.target;
    
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

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      
      // Filter empty requirements
      const filteredRequirements = formData.requirements.filter(r => r.trim());
      
      const submitData = {
        title: formData.title,
        description: formData.description,
        requirements: filteredRequirements.length > 0 ? filteredRequirements : undefined,
        location: formData.location || undefined,
        jobType: formData.jobType,
        pricingType: formData.pricingType,
        status: formData.status,
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
      
      const res = await axios.put(`${API_BASE_URL}/jobs/${job._id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('Job updated successfully!');
      setIsEditing(false);
      setJob(res.data);
      
      if (onJobUpdated) {
        onJobUpdated(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/jobs/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (onJobDeleted) {
        onJobDeleted(job._id);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to delete job');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getJobTypeBadge = (jobType) => {
    const badges = {
      remote: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Remote' },
      on_site: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'On-Site' },
      hybrid: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Hybrid' }
    };
    return badges[jobType] || badges.remote;
  };

  const getPricingTypeBadge = (pricingType) => {
    const badges = {
      hourly: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Hourly' },
      fixed_price: { bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'Fixed Price' }
    };
    return badges[pricingType] || badges.hourly;
  };

  const inputClasses = "w-full px-4 py-3 text-base rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed";
  const selectClasses = `${inputClasses} appearance-none cursor-pointer`;

  const renderCompensationFields = () => {
    const { pricingType } = formData;
    
    if (pricingType === 'hourly') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Hourly Rate ($)</label>
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">Min Hours</label>
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">Max Hours</label>
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">Total Budget ($)</label>
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

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Job not found</p>
      </div>
    );
  }

  const jobTypeBadge = getJobTypeBadge(job.jobType);
  const pricingBadge = getPricingTypeBadge(job.pricingType);

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-teal-400 hover:text-emerald-400 font-medium mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2">
                {isEditing ? 'Edit Job' : 'Job Details'}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {isEditing ? 'Update the job information below' : 'View and manage this job posting'}
              </p>
            </div>
            
            {!isEditing && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onViewApplications && onViewApplications(job)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition font-medium"
                >
                  <Users className="w-4 h-4" />
                  Applications
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500/20 transition font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border-glow"
        >
          {isEditing ? (
            // Edit Form
            <form onSubmit={handleUpdate} className="space-y-6">
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
                        Vacancies
                      </label>
                      <input
                        type="number"
                        name="vacancies"
                        value={formData.vacancies}
                        onChange={handleChange}
                        min="1"
                        disabled={loading}
                        className={inputClasses}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Timezone
                      </label>
                      <input
                        type="text"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        placeholder="e.g., EST, PST"
                        disabled={loading}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-light rounded-2xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Job Type & Status
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Job Type
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      disabled={loading}
                      className={selectClasses}
                    >
                      <option value="remote">Remote</option>
                      <option value="on_site">On-Site</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Pricing Type
                    </label>
                    <select
                      name="pricingType"
                      value={formData.pricingType}
                      onChange={handleChange}
                      disabled={loading}
                      className={selectClasses}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="fixed_price">Fixed Price</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                      className={selectClasses}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-light rounded-2xl p-6">
                <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Compensation
                </h3>
                {renderCompensationFields()}
              </div>

              <div className="glass-light rounded-2xl p-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={loading}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="glass-light rounded-2xl p-6">
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description & Requirements
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Description <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      name="description"
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
                      Requirements
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
                      className="mt-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition text-sm"
                    >
                      + Add Requirement
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-lg font-bold rounded-xl shadow-lg transition ${
                    loading
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 hover:shadow-glow"
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (job) {
                      let requirements = [''];
                      if (Array.isArray(job.requirements)) {
                        requirements = job.requirements.length > 0 ? job.requirements : [''];
                      } else if (typeof job.requirements === 'string' && job.requirements) {
                        requirements = [job.requirements];
                      }
                      
                      const compensation = {
                        hourly: { hourlyRate: '', estimatedHours: '', minHours: '', maxHours: '' },
                        fixedPrice: { totalBudget: '', estimatedDuration: '' }
                      };
                      
                      if (job.compensation) {
                        if (job.compensation.hourly) {
                          compensation.hourly = {
                            hourlyRate: job.compensation.hourly.hourlyRate || '',
                            estimatedHours: job.compensation.hourly.estimatedHours || '',
                            minHours: job.compensation.hourly.minHours || '',
                            maxHours: job.compensation.hourly.maxHours || ''
                          };
                        }
                        if (job.compensation.fixedPrice) {
                          compensation.fixedPrice = {
                            totalBudget: job.compensation.fixedPrice.totalBudget || '',
                            estimatedDuration: job.compensation.fixedPrice.estimatedDuration || ''
                          };
                        }
                      }
                      
                      setFormData({
                        title: job.title || '',
                        description: job.description || '',
                        requirements,
                        location: job.location || '',
                        jobType: job.jobType || 'remote',
                        pricingType: job.pricingType || 'hourly',
                        compensation,
                        status: job.status || 'active',
                        timezone: job.timezone || '',
                        vacancies: job.vacancies || 1
                      });
                    }
                  }}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 text-lg font-semibold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 text-sm text-slate-300">
                <span className="font-semibold text-cyan-300">Live job profile — </span>
                Candidates see this posting on the job board. Open <strong className="text-white">Applications</strong> to review
                people who applied and their cover letters.
              </div>
              {/* Job Header */}
              <div className="border-b border-slate-700/50 pb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{job.title}</h3>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${jobTypeBadge.bg} ${jobTypeBadge.text}`}>
                    {jobTypeBadge.label}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${pricingBadge.bg} ${pricingBadge.text}`}>
                    {pricingBadge.label}
                  </span>
                  {job.status && (
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      job.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      job.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                      job.status === 'closed' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {job.employer && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-5 h-5 text-teal-400" />
                      <span className="font-medium">{job.employer.name || 'Employer'}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-5 h-5 text-teal-400" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.category && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      <span>{job.category.name || job.category}</span>
                    </div>
                  )}
                  {job.vacancies > 1 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span>{job.vacancies} vacancies</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">Posted {formatDate(job.postedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-light rounded-xl p-6">
                <h4 className="text-lg font-bold text-teal-400 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Description
                </h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {/* Requirements */}
              <div className="glass-light rounded-xl p-6">
                <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Requirements
                </h4>
                {Array.isArray(job.requirements) ? (
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                )}
              </div>

              {/* Skills */}
              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm">
                        {skill.skill} {skill.level && skill.level !== 'intermediate' && `(${skill.level})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compensation */}
              {job.compensation && (
                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Compensation Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    {job.pricingType === 'hourly' && job.compensation.hourly && (
                      <>
                        {job.compensation.hourly.hourlyRate && (
                          <div>
                            <span className="text-slate-500">Hourly Rate:</span>
                            <span className="ml-2 text-slate-300">${job.compensation.hourly.hourlyRate}</span>
                          </div>
                        )}
                        {job.compensation.hourly.estimatedHours && (
                          <div>
                            <span className="text-slate-500">Est. Hours:</span>
                            <span className="ml-2 text-slate-300">{job.compensation.hourly.estimatedHours}</span>
                          </div>
                        )}
                        {job.compensation.hourly.minHours && (
                          <div>
                            <span className="text-slate-500">Min Hours:</span>
                            <span className="ml-2 text-slate-300">{job.compensation.hourly.minHours}</span>
                          </div>
                        )}
                        {job.compensation.hourly.maxHours && (
                          <div>
                            <span className="text-slate-500">Max Hours:</span>
                            <span className="ml-2 text-slate-300">{job.compensation.hourly.maxHours}</span>
                          </div>
                        )}
                        {job.estimatedEarnings && (
                          <div className="col-span-full">
                            <span className="text-slate-500">Est. Total:</span>
                            <span className="ml-2 text-emerald-400 font-medium">${job.estimatedEarnings}</span>
                          </div>
                        )}
                      </>
                    )}
                    {job.pricingType === 'fixed_price' && job.compensation.fixedPrice && (
                      <>
                        {job.compensation.fixedPrice.totalBudget && (
                          <div>
                            <span className="text-slate-500">Total Budget:</span>
                            <span className="ml-2 text-emerald-400 font-medium">${job.compensation.fixedPrice.totalBudget}</span>
                          </div>
                        )}
                        {job.compensation.fixedPrice.estimatedDuration && (
                          <div>
                            <span className="text-slate-500">Duration:</span>
                            <span className="ml-2 text-slate-300">{job.compensation.fixedPrice.estimatedDuration}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Timezone */}
              {job.timezone && (
                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timezone Preference
                  </h4>
                  <p className="text-slate-300">{job.timezone}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetail;
