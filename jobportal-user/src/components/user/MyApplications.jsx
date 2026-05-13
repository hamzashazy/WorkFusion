import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, XCircle } from 'lucide-react';
import { ApplicationsAPI } from '../../services/api';

const STATUS_STYLES = {
  applied: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  viewed: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  shortlisted: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  interview: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  offer: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  hired: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  withdrawn: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const STATUS_LABELS = { applied: 'Applied', viewed: 'Viewed', shortlisted: 'Shortlisted', interview: 'Interview', offer: 'Offer', hired: 'Hired', rejected: 'Rejected', withdrawn: 'Withdrawn' };

export default function MyApplications({ user }) {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [applications, appStats] = await Promise.all([
        ApplicationsAPI.getMy(),
        ApplicationsAPI.getStats(),
      ]);
      setApps(applications);
      setStats(appStats);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
    try {
      await ApplicationsAPI.withdraw(appId);
      load();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to withdraw');
    }
  };

  const filtered = filter ? apps.filter(a => a.status === filter) : apps;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filter ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
          All ({stats.total || 0})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = stats[key] || 0;
          if (count === 0) return null;
          const st = STATUS_STYLES[key];
          return (
            <button key={key} onClick={() => setFilter(filter === key ? '' : key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === key ? `${st.bg} ${st.border} ${st.text}` : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-400">No applications yet</p>
          <p className="text-sm text-slate-500 mb-4">Start applying to jobs you like</p>
          <button onClick={() => navigate('/dashboard/browse')} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors">Browse Jobs</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const st = STATUS_STYLES[app.status] || STATUS_STYLES.applied;
            const canWithdraw = !['withdrawn', 'rejected', 'hired'].includes(app.status);
            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-4 hover:border-primary-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl ${st.bg} flex items-center justify-center ${st.text} font-bold text-lg flex-shrink-0`}>
                    {app.companyName?.[0]?.toUpperCase() || 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => navigate(`/dashboard/job/${app.jobId}`)} className="text-[15px] font-semibold text-white hover:text-primary-400 transition-colors text-left truncate block w-full">{app.jobTitle}</button>
                    <p className="text-sm text-slate-400">{app.companyName}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${st.bg} ${st.text} ${st.border} border font-medium flex-shrink-0`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {app.proposedRate > 0 && <span className="text-slate-400">${app.proposedRate}/hr</span>}
                  </div>
                  {canWithdraw && (
                    <button onClick={() => handleWithdraw(app.id)}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium">
                      <XCircle className="w-4 h-4" /> Withdraw
                    </button>
                  )}
                </div>
                {app.coverMessage && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">"{app.coverMessage}"</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
