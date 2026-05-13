import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  User,
  Mail,
  FileText,
  Calendar,
  Check,
  X,
  Eye,
  UserCheck,
  Briefcase,
  RefreshCw,
  DollarSign,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const availabilityLabel = (v) =>
  ({
    immediately: 'Immediately',
    within_week: 'Within 1 week',
    within_2_weeks: 'Within 2 weeks',
    flexible: 'Flexible',
  }[v] || v?.replace(/_/g, ' ') || '—');

const ApplicationList = ({ jobId, jobTitle, onBack }) => {
  const [applications, setApplications] = useState([]);
  const [resolvedTitle, setResolvedTitle] = useState(jobTitle || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [expandedCover, setExpandedCover] = useState({});
  const [profileModal, setProfileModal] = useState(null);

  useEffect(() => {
    setResolvedTitle(jobTitle || '');
  }, [jobTitle]);

  useEffect(() => {
    if (jobTitle || !jobId) return;
    const token = localStorage.getItem('token');
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!cancelled && res.data?.title) setResolvedTitle(res.data.title);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId, jobTitle]);

  const fetchApplications = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const applicationsData = res.data?.data ?? res.data;
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setError(null);
    } catch (err) {
      setApplications([]);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          'Failed to load applications'
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    const statusLabels = {
      viewed: 'mark as viewed',
      shortlisted: 'shortlist',
      interview: 'move to interview',
      offer: 'mark offer extended',
      hired: 'hire',
      rejected: 'reject',
    };

    if (!window.confirm(`Are you sure you want to ${statusLabels[newStatus] || 'update'} this application?`)) {
      return;
    }

    try {
      setUpdateLoading(applicationId);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert(err.response?.data?.msg || err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdateLoading(null);
    }
  };

  const toggleCover = (applicationId) => {
    setExpandedCover((prev) => ({ ...prev, [applicationId]: !prev[applicationId] }));
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      viewed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shortlisted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      interview: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      offer: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      hired: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      withdrawn: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getBidTypeLabel = (bidType) => {
    const labels = { hourly: '/hour', fixed: ' (fixed)', monthly: '/month' };
    return labels[bidType] || '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const resumeForApp = (application) => {
    const fromApp = application.resumeUrl;
    const fromProfile = application.applicant?.profile?.resume;
    return (fromApp && String(fromApp).trim()) || (fromProfile && String(fromProfile).trim()) || '';
  };

  const portfolioForApp = (application) => {
    const fromApp = application.portfolioUrl;
    const fromProfile = application.applicant?.profile?.portfolio;
    return (fromApp && String(fromApp).trim()) || (fromProfile && String(fromProfile).trim()) || '';
  };

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 text-slate-400">
        Missing job. Go back to My Jobs and open a posting again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading applications...</p>
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
          <p className="text-lg font-semibold text-white mb-2">Could not load applications</p>
          <p className="text-slate-400 mb-2 text-sm break-words">{error}</p>
          <p className="text-xs text-slate-500 mb-6">
            Confirm REACT_APP_API_URL matches your backend and you are logged in as the employer who posted this job.
          </p>
          <button
            onClick={fetchApplications}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-glow transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-teal-400 hover:text-emerald-400 font-medium mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to job
          </button>

          <h2 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2">
            Applications{resolvedTitle ? ` — ${resolvedTitle}` : ''}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
          </p>
        </motion.div>

        {applications.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center max-w-md">
              <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="w-16 h-16 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No applications yet</h3>
              <p className="text-slate-400">Candidates who apply will appear here with their cover letter and links.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application, index) => {
              const resumeHref = resumeForApp(application);
              const portfolioHref = portfolioForApp(application);
              const cover = application.coverMessage || '';

              return (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl overflow-hidden card-hover"
                >
                  <div className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 p-6 border-b border-slate-700/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-full shadow-glow shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white truncate">
                            {application.applicant?.name || 'Applicant'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-slate-400">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span className="text-sm truncate">{application.applicant?.email || '—'}</span>
                          </div>
                        </div>
                      </div>
                      {application.employerRating && (
                        <div className="flex items-center gap-1 shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < application.employerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileModal(application)}
                      className="mt-4 text-sm font-medium text-teal-300 hover:text-teal-200 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      View candidate profile
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-500">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                      {application.proposedRate != null && application.proposedRate !== '' && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span>Proposed: ${application.proposedRate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>{availabilityLabel(application.availability)}</span>
                      </div>
                    </div>

                    {cover && (
                      <div className="glass-light rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Cover letter
                          </h4>
                          <button
                            type="button"
                            onClick={() => toggleCover(application._id)}
                            className="text-slate-400 hover:text-white transition"
                          >
                            {expandedCover[application._id] ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p
                          className={`text-sm text-slate-300 whitespace-pre-line ${
                            expandedCover[application._id] ? '' : 'line-clamp-4'
                          }`}
                        >
                          {cover}
                        </p>
                      </div>
                    )}

                    {Array.isArray(application.showcasedProjects) && application.showcasedProjects.length > 0 && (
                      <div className="glass-light rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Showcased work (picked for this job)
                        </h4>
                        <ul className="space-y-3">
                          {application.showcasedProjects.map((sp, i) => (
                            <li
                              key={i}
                              className="rounded-lg border border-slate-600/40 bg-slate-800/30 p-3 text-sm text-slate-300"
                            >
                              <p className="font-semibold text-white">{sp.title || 'Project'}</p>
                              {sp.role && <p className="text-xs text-slate-500 mt-0.5">Role: {sp.role}</p>}
                              {sp.skills && <p className="text-xs text-slate-500 mt-0.5">Skills: {sp.skills}</p>}
                              {sp.description && (
                                <p className="text-xs text-slate-400 mt-2 whitespace-pre-line line-clamp-4">{sp.description}</p>
                              )}
                              {sp.projectUrl && (
                                <a
                                  href={sp.projectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs mt-2"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open link
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {application.proposal && (
                      <div className="glass-light rounded-xl p-4 space-y-3 border border-slate-600/40">
                        <h4 className="text-sm font-bold text-slate-400">Legacy proposal (if any)</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {application.proposal.bidAmount != null && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-400" />
                              <span className="text-slate-300">
                                ${application.proposal.bidAmount}
                                {getBidTypeLabel(application.proposal.bidType)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 text-sm">
                      {resumeHref && (
                        <a
                          href={resumeHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-teal-400 hover:text-emerald-400 transition truncate"
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          Resume / CV
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                      )}
                      {portfolioHref && (
                        <a
                          href={portfolioHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition truncate"
                        >
                          <LinkIcon className="w-4 h-4 shrink-0" />
                          Portfolio / website
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="text-sm">Applied {formatDate(application.appliedAt)}</span>
                    </div>

                    {application.employerNotes && (
                      <div className="pt-2 border-t border-slate-700/50">
                        <p className="text-sm text-slate-500 mb-1">Your notes</p>
                        <p className="text-sm text-slate-400 italic">{application.employerNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {application.status === 'applied' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(application._id, 'viewed')}
                          disabled={updateLoading === application._id}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                          Mark viewed
                        </button>
                      )}
                      {!['shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'].includes(
                        application.status
                      ) && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                          disabled={updateLoading === application._id}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                          <Star className="w-4 h-4" />
                          Shortlist
                        </button>
                      )}
                      {!['interview', 'offer', 'hired', 'rejected', 'withdrawn'].includes(application.status) && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(application._id, 'interview')}
                          disabled={updateLoading === application._id}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4" />
                          Interview
                        </button>
                      )}
                      {application.status === 'interview' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(application._id, 'offer')}
                          disabled={updateLoading === application._id}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                          <FileText className="w-4 h-4" />
                          Offer
                        </button>
                      )}
                      {!['hired', 'rejected', 'withdrawn'].includes(application.status) && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(application._id, 'hired')}
                          disabled={updateLoading === application._id}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Hire
                        </button>
                      )}
                      {!['rejected', 'hired', 'withdrawn'].includes(application.status) && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          disabled={updateLoading === application._id}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition font-medium text-sm disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {profileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setProfileModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass rounded-2xl border border-slate-700 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Candidate profile</h3>
                  <p className="text-teal-400 font-medium">{profileModal.applicant?.name}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {profileModal.applicant?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {profileModal.applicant?.profile?.bio && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Bio</p>
                  <p className="text-sm text-slate-300 whitespace-pre-line">{profileModal.applicant.profile.bio}</p>
                </div>
              )}
              {Array.isArray(profileModal.applicant?.profile?.projects) && profileModal.applicant.profile.projects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Portfolio on profile</p>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {profileModal.applicant.profile.projects.map((proj) => (
                      <li key={proj._id} className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 text-sm">
                        <p className="font-medium text-white">{proj.title}</p>
                        {proj.role && <p className="text-xs text-slate-500 mt-0.5">{proj.role}</p>}
                        {proj.skills && <p className="text-xs text-slate-500">Skills: {proj.skills}</p>}
                        {proj.projectUrl && (
                          <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 text-xs mt-1 inline-flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Link
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-2 text-sm">
                {resumeForApp(profileModal) && (
                  <a
                    href={resumeForApp(profileModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-teal-400 hover:underline"
                  >
                    <FileText className="w-4 h-4" /> Open resume / CV
                  </a>
                )}
                {portfolioForApp(profileModal) && (
                  <a
                    href={portfolioForApp(profileModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" /> Open portfolio / site
                  </a>
                )}
                {!resumeForApp(profileModal) &&
                  !portfolioForApp(profileModal) &&
                  !profileModal.applicant?.profile?.bio &&
                  !(profileModal.applicant?.profile?.projects?.length > 0) && (
                  <p className="text-slate-500 text-sm">No bio or links on file for this candidate.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setProfileModal(null)}
                className="mt-6 w-full py-3 rounded-xl bg-slate-800 text-slate-200 font-medium hover:bg-slate-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationList;
