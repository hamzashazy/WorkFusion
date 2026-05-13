import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { SavedJobsLocal } from '../../services/api';
import JobCard from './JobCard';

export default function SavedJobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const saved = await SavedJobsLocal.getSaved(user.id);
      setJobs(saved);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('storage-updated', handler);
    return () => window.removeEventListener('storage-updated', handler);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-400">No saved jobs</p>
          <p className="text-sm text-slate-500 mb-4">Bookmark jobs you're interested in</p>
          <button onClick={() => navigate('/dashboard/browse')} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors">Browse Jobs</button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} user={user} onClick={() => navigate(`/dashboard/job/${job.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
