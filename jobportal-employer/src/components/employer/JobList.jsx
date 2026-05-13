import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, DollarSign, Calendar, Edit, Trash2, Eye, RefreshCw, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const JobList = ({ onViewJob, onEditJob }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use the /my endpoint which returns only employer's own jobs
      const res = await axios.get(`${API_BASE_URL}/jobs/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle paginated response format { success, count, data }
      const jobsData = res.data.data || res.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      setDeleteLoading(jobId);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.msg || err.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const getCompensationDisplay = (job) => {
    if (!job.compensation) return null;
    
    if (job.pricingType === 'hourly' && job.compensation.hourly) {
      const { hourlyRate, estimatedHours } = job.compensation.hourly;
      if (hourlyRate) {
        let display = `$${hourlyRate}/hr`;
        if (estimatedHours) {
          display += ` (~${estimatedHours} hrs)`;
        }
        return display;
      }
    }
    
    if (job.pricingType === 'fixed_price' && job.compensation.fixedPrice) {
      const { totalBudget, estimatedDuration } = job.compensation.fixedPrice;
      if (totalBudget) {
        let display = `$${totalBudget}`;
        if (estimatedDuration) {
          display += ` (${estimatedDuration})`;
        }
        return display;
      }
    }
    
    // Fallback to estimatedEarnings virtual
    if (job.estimatedEarnings) {
      return `$${job.estimatedEarnings}`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-lg font-semibold text-white mb-2">Error Loading Jobs</p>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={fetchJobs}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-glow transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Briefcase className="w-16 h-16 text-teal-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Jobs Posted Yet</h3>
          <p className="text-slate-400 mb-6">
            You haven't posted any job listings yet. Click "Post Job" in the sidebar to create your first job posting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2">
            My Job Postings
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Manage all your active job listings ({jobs.length} {jobs.length === 1 ? 'job' : 'jobs'})
          </p>
        </motion.div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => {
            const jobTypeBadge = getJobTypeBadge(job.jobType);
            const pricingBadge = getPricingTypeBadge(job.pricingType);
            const compensationDisplay = getCompensationDisplay(job);
            
            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl overflow-hidden card-hover group"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 p-6 border-b border-slate-700/50">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">
                    {job.title}
                  </h3>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${jobTypeBadge.bg} ${jobTypeBadge.text}`}>
                      {jobTypeBadge.label}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${pricingBadge.bg} ${pricingBadge.text}`}>
                      {pricingBadge.label}
                    </span>
                    {job.status && job.status !== 'active' && (
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-500/20 text-slate-400">
                        {job.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  {job.location && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                  )}

                  {job.category && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm">{job.category.name || job.category}</span>
                    </div>
                  )}

                  {compensationDisplay && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm">{compensationDisplay}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Posted {formatDate(job.postedAt)}</span>
                  </div>

                  <div className="pt-2">
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={() => onViewJob && onViewJob(job)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500/20 transition font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => onEditJob && onEditJob(job)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    disabled={deleteLoading === job._id}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobList;
