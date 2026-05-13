import React from 'react';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Users } from 'lucide-react';
import { SavedJobsLocal } from '../../services/api';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function JobCard({ job, user, onClick, compact = false }) {
  const isSaved = user && SavedJobsLocal.isSaved(user.id, job.id);
  const payLabel = job.pricingType === 'hourly' ? `$${job.hourlyRate}/hr` : `$${job.totalBudget} fixed`;
  const typeLabel = { remote: 'Remote', on_site: 'On-site', hybrid: 'Hybrid' }[job.jobType] || job.jobType;

  const handleSave = (e) => {
    e.stopPropagation();
    if (!user) return;
    SavedJobsLocal.toggle(user.id, job.id);
  };

  return (
    <div onClick={onClick} className="glass rounded-xl p-4 lg:p-5 cursor-pointer hover:border-primary-500/30 transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-400 font-bold text-lg flex-shrink-0">
          {job.companyName?.[0]?.toUpperCase() || 'C'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-white group-hover:text-primary-400 transition-colors truncate">{job.title}</h3>
          <p className="text-sm text-slate-400">{job.companyName}</p>
        </div>
        {user && (
          <button onClick={handleSave} className="flex-shrink-0 text-slate-500 hover:text-primary-400 transition-colors">
            {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary-400" /> : <Bookmark className="w-5 h-5" />}
          </button>
        )}
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <MapPin className="w-3.5 h-3.5" /> {typeLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <DollarSign className="w-3.5 h-3.5" /> {payLabel}
            </span>
            {job.categoryName && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
                {job.categoryName}
              </span>
            )}
          </div>

          {job.skillsRequired?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skillsRequired.slice(0, 4).map((s, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{s.skill}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" /> {timeAgo(job.postedAt)}</span>
            {job.vacancies > 1 && (
              <span className="flex items-center gap-1 text-xs text-primary-400"><Users className="w-3.5 h-3.5" /> {job.vacancies} openings</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
