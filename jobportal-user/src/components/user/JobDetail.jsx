import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Bookmark,
  BookmarkCheck,
  Calendar,
  GraduationCap,
  Briefcase,
  Send,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react';
import { JobsAPI, ApplicationsAPI, SavedJobsLocal } from '../../services/api';

const AVAILABILITY_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'within_week', label: 'Within 1 week' },
  { value: 'within_2_weeks', label: 'Within 2 weeks' },
  { value: 'flexible', label: 'Flexible' },
];

export default function JobDetail({ user }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    resumeSource: 'profile',
    resumeUrl: '',
    portfolioUrl: '',
    proposedRate: '',
    availability: 'flexible',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);

  const toggleProjectSelection = (id) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const openApplyModal = useCallback(() => {
    setError('');
    setSelectedProjectIds([]);
    setApplyForm({
      coverLetter: '',
      resumeSource: user?.resume ? 'profile' : 'custom',
      resumeUrl: user?.resume || '',
      portfolioUrl: user?.portfolio || '',
      proposedRate:
        job?.pricingType === 'hourly'
          ? job.hourlyRate != null
            ? String(job.hourlyRate)
            : ''
          : job?.totalBudget != null
            ? String(job.totalBudget)
            : '',
      availability: 'flexible',
    });
    setShowApply(true);
  }, [user?.resume, user?.portfolio, job]);

  useEffect(() => {
    const load = async () => {
      try {
        const j = await JobsAPI.getById(jobId);
        setJob(j);
        if (user && j) {
          setIsSaved(SavedJobsLocal.isSaved(user.id, j.id));
          try {
            const applied = await ApplicationsAPI.hasApplied(j.id);
            setHasApplied(applied);
          } catch {
            setHasApplied(false);
          }
        }
      } catch (err) {
        console.error('Failed to load job:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, user]);

  const handleSave = () => {
    if (!user || !job) return;
    SavedJobsLocal.toggle(user.id, job.id);
    setIsSaved(!isSaved);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    const letter = applyForm.coverLetter.trim();
    if (letter.length < 40) {
      return setError('Please write a cover letter of at least a few sentences (40+ characters).');
    }

    const resumeUrl =
      applyForm.resumeSource === 'profile'
        ? (user?.resume || '').trim()
        : (applyForm.resumeUrl || '').trim();

    if (!resumeUrl) {
      return setError(
        applyForm.resumeSource === 'profile'
          ? 'Add a resume link in your profile first, or choose “Custom link” and paste a URL.'
          : 'Please paste a valid resume or CV link (Google Drive, Dropbox, PDF, etc.).'
      );
    }

    setApplying(true);
    try {
      await ApplicationsAPI.apply(job.id, {
        coverMessage: letter,
        proposedRate: applyForm.proposedRate,
        availability: applyForm.availability,
        resumeUrl,
        portfolioUrl: (applyForm.portfolioUrl || '').trim() || undefined,
        showcasedProjectIds: selectedProjectIds,
      });
      setHasApplied(true);
      setShowApply(false);
      setSuccess('Your application was sent to the employer.');
      setTimeout(() => setSuccess(''), 4500);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return <div className="text-center py-20 text-slate-400">Job not found</div>;

  const typeLabel = { remote: 'Remote', on_site: 'On-site', hybrid: 'Hybrid' }[job.jobType] || job.jobType;
  const payLabel = job.pricingType === 'hourly' ? `$${job.hourlyRate}/hr` : `$${job.totalBudget} fixed`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-400 font-bold text-xl flex-shrink-0">
            {job.companyName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-slate-400">{job.companyName}</p>
            <p className="text-xs text-slate-500 mt-1">
              Posted{' '}
              {new Date(job.postedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {user && (
            <button type="button" onClick={handleSave} className="text-slate-500 hover:text-primary-400 transition-colors shrink-0">
              {isSaved ? <BookmarkCheck className="w-6 h-6 text-primary-400" /> : <Bookmark className="w-6 h-6" />}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {[
            { icon: MapPin, text: typeLabel },
            { icon: DollarSign, text: payLabel },
            { icon: Briefcase, text: job.categoryName },
            ...(job.location ? [{ icon: MapPin, text: job.location }] : []),
            ...(job.timezone ? [{ icon: Clock, text: job.timezone }] : []),
            { icon: Users, text: `${job.vacancies} ${job.vacancies === 1 ? 'opening' : 'openings'}` },
          ].map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
            >
              <c.icon className="w-3.5 h-3.5" /> {c.text}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="glass rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white mb-2">Description</h2>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>
        {job.requirements?.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-2">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {job.skillsRequired?.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-2">Skills required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                >
                  {s.skill} <span className="text-emerald-500/60">{s.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: DollarSign, label: 'Compensation', value: job.pricingType === 'hourly' ? 'Hourly' : 'Fixed price' },
            ...(job.pricingType === 'hourly'
              ? [{ icon: DollarSign, label: 'Rate', value: `$${job.hourlyRate}/hr` }]
              : [{ icon: DollarSign, label: 'Budget', value: `$${job.totalBudget}` }]),
            ...(job.estimatedDuration ? [{ icon: Calendar, label: 'Duration', value: job.estimatedDuration }] : []),
            ...(job.estimatedHours ? [{ icon: Clock, label: 'Est. hours', value: `${job.estimatedHours} hrs` }] : []),
            ...((job.minYearsExp || job.maxYearsExp)
              ? [{ icon: Briefcase, label: 'Experience', value: `${job.minYearsExp}-${job.maxYearsExp} years` }]
              : []),
            ...(job.educationRequired && job.educationRequired !== 'none'
              ? [{ icon: GraduationCap, label: 'Education', value: job.educationRequired.replace(/_/g, ' ') }]
              : []),
          ].map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <d.icon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">{d.label}</span>
              </div>
              <p className="text-sm font-medium text-white capitalize">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-40 md:static md:bg-transparent md:p-0 md:z-0">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              if (!hasApplied) openApplyModal();
            }}
            disabled={hasApplied}
            className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              hasApplied ? 'bg-slate-700 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20'
            }`}
          >
            <Send className="w-5 h-5" />
            {!user ? 'Sign in to apply' : hasApplied ? 'Application sent' : 'Apply now'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showApply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => !applying && setShowApply(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-2xl bg-slate-900 border border-slate-700 sm:rounded-2xl rounded-t-2xl p-6 max-h-[92vh] overflow-y-auto shadow-2xl"
            >
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-400/90 mb-1">Application</p>
                <h3 className="text-xl font-bold text-white">Apply to {job.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{job.companyName}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">{error}</div>
              )}

              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Cover letter</label>
                  <p className="text-xs text-slate-500 mb-2">
                    Introduce yourself, highlight relevant experience, and explain why you want this role.
                  </p>
                  <textarea
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm((f) => ({ ...f, coverLetter: e.target.value }))}
                    rows={8}
                    placeholder="Dear hiring team…"
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-y min-h-[160px] focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition-colors text-sm leading-relaxed"
                  />
                  <p className="text-xs text-slate-500 mt-1">{applyForm.coverLetter.length} characters</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
                    <FileText className="w-4 h-4 text-primary-400" />
                    Resume / CV
                  </div>
                  {user?.resume ? (
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="resumeSrc"
                          className="mt-1"
                          checked={applyForm.resumeSource === 'profile'}
                          onChange={() => setApplyForm((f) => ({ ...f, resumeSource: 'profile', resumeUrl: user.resume || '' }))}
                        />
                        <span>
                          <span className="text-slate-200 text-sm font-medium group-hover:text-white">Use resume from my profile</span>
                          <span className="block text-xs text-slate-500 truncate max-w-full mt-0.5">{user.resume}</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="resumeSrc"
                          className="mt-1"
                          checked={applyForm.resumeSource === 'custom'}
                          onChange={() => setApplyForm((f) => ({ ...f, resumeSource: 'custom' }))}
                        />
                        <span className="text-slate-200 text-sm font-medium group-hover:text-white">Use a different link for this application</span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      You have no resume saved on your profile. Paste a public link below (Google Drive, PDF, etc.), or add one in{' '}
                      <span className="text-amber-100 font-medium">Profile</span> for faster applying next time.
                    </p>
                  )}
                  {(applyForm.resumeSource === 'custom' || !user?.resume) && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Resume link</label>
                      <input
                        type="url"
                        value={applyForm.resumeUrl}
                        onChange={(e) => setApplyForm((f) => ({ ...f, resumeUrl: e.target.value }))}
                        placeholder="https://…"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                    <LinkIcon className="w-4 h-4 text-primary-400" />
                    Portfolio or personal website <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={applyForm.portfolioUrl}
                    onChange={(e) => setApplyForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
                    placeholder="https://github.com/… or Behance, Dribbble, etc."
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-500 focus:border-primary-500"
                  />
                </div>

                {user?.projects?.length > 0 && (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
                        <LayoutGrid className="w-4 h-4 text-primary-400 shrink-0" />
                        Showcase projects
                      </div>
                      <span className="text-xs text-slate-500">{selectedProjectIds.length}/5</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Choose portfolio pieces from your profile to attach to this application (similar to Upwork).
                    </p>
                    <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {user.projects.map((p) => (
                        <li key={p.id}>
                          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-700/80 p-3 hover:bg-slate-800/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedProjectIds.includes(p.id)}
                              onChange={() => toggleProjectSelection(p.id)}
                              className="mt-1 rounded border-slate-500 text-primary-500 focus:ring-primary-500/30"
                            />
                            <span className="min-w-0">
                              <span className="text-sm font-medium text-white block">{p.title || 'Untitled'}</span>
                              {p.role ? <span className="text-xs text-slate-500 block mt-0.5">{p.role}</span> : null}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      {job.pricingType === 'hourly' ? 'Proposed hourly rate ($)' : 'Proposed budget ($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={applyForm.proposedRate}
                      onChange={(e) => setApplyForm((f) => ({ ...f, proposedRate: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white text-sm focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Availability</label>
                    <select
                      value={applyForm.availability}
                      onChange={(e) => setApplyForm((f) => ({ ...f, availability: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white text-sm focus:border-primary-500"
                    >
                      {AVAILABILITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={applying}
                    onClick={() => setShowApply(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
