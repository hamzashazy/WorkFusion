import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Globe, FileText, Edit2, Save, X, Building, CheckCircle, Shield, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companyWebsite: '',
    bio: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        companyName: res.data.profile?.companyName || '',
        companyWebsite: res.data.profile?.companyWebsite || '',
        bio: res.data.profile?.bio || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name,
        profile: {
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          bio: formData.bio
        }
      };

      const res = await axios.put(`${API_BASE_URL}/auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProfile(res.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        companyName: res.data.profile?.companyName || '',
        companyWebsite: res.data.profile?.companyWebsite || '',
        bio: res.data.profile?.bio || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        companyName: profile.profile?.companyName || '',
        companyWebsite: profile.profile?.companyWebsite || '',
        bio: profile.profile?.bio || ''
      });
    }
  };

  const inputClasses = "w-full px-4 py-3 text-base rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2">
                {isEditing ? 'Edit Profile' : 'My Profile'}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {isEditing ? 'Update your business information' : 'Manage your employer account'}
              </p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500/20 transition font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
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

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden border-glow"
        >
          {/* Profile Header with Gradient */}
          <div className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 p-8 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-glow">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{profile?.name || 'Employer Account'}</h3>
                <p className="text-slate-400">{profile?.email || ''}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm font-medium">
                  {profile?.role === 'employer' ? 'Employer' : 'Account'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {isEditing ? (
              // Edit Form
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="glass-light rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Your Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={updateLoading}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className={`${inputClasses} cursor-not-allowed opacity-60`}
                      />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                <div className="glass-light rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        disabled={updateLoading}
                        placeholder="e.g., Acme Corporation"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Business Website
                      </label>
                      <input
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        disabled={updateLoading}
                        placeholder="https://example.com"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Business Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={updateLoading}
                      rows="4"
                      placeholder="Tell us about your business..."
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-lg font-bold rounded-xl shadow-lg transition ${
                      updateLoading
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 hover:shadow-glow"
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updateLoading}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-light rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
                      <User className="w-4 h-4 text-teal-400" />
                      Name
                    </label>
                    <p className="text-lg text-white font-medium">
                      {profile?.name || 'Not provided'}
                    </p>
                  </div>

                  <div className="glass-light rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
                      <Mail className="w-4 h-4 text-teal-400" />
                      Email
                    </label>
                    <p className="text-lg text-white font-medium">
                      {profile?.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-light rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
                      <Building className="w-4 h-4 text-emerald-400" />
                      Business Name
                    </label>
                    <p className="text-lg text-white font-medium">
                      {profile?.profile?.companyName || 'Not provided'}
                    </p>
                  </div>

                  <div className="glass-light rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Business Website
                    </label>
                    {profile?.profile?.companyWebsite ? (
                      <a
                        href={profile.profile.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-teal-400 hover:text-emerald-400 font-medium transition"
                      >
                        {profile.profile.companyWebsite}
                      </a>
                    ) : (
                      <p className="text-lg text-white font-medium">Not provided</p>
                    )}
                  </div>
                </div>

                <div className="glass-light rounded-xl p-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-3">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Business Bio
                  </label>
                  {profile?.profile?.bio ? (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {profile.profile.bio}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">No bio provided yet</p>
                  )}
                </div>

                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-400" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-300">Role:</span> 
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full text-xs font-medium">
                        {profile?.role === 'employer' ? 'Employer' : 'User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold text-slate-300">Created:</span> 
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerProfile;
