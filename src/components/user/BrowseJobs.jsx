import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { JobsAPI, CategoriesAPI, categoryIconPlainText } from '../../services/api';
import JobCard from './JobCard';

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'remote', label: 'Remote' },
  { value: 'on_site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];
const PRICING = [
  { value: '', label: 'All Pricing' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'fixed_price', label: 'Fixed Price' },
];

export default function BrowseJobs({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [jobType, setJobType] = useState('');
  const [pricingType, setPricingType] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams.get('cat') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    CategoriesAPI.getParents().then(setCategories).catch(() => {});
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (jobType) params.jobType = jobType;
      if (pricingType) params.pricingType = pricingType;
      if (categoryId) params.category = categoryId;
      const data = await JobsAPI.getAll(params);
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [query, jobType, pricingType, categoryId]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const clearFilters = () => {
    setJobType('');
    setPricingType('');
    setCategoryId('');
    setQuery('');
    setSearchParams({});
  };

  const hasFilters = jobType || pricingType || categoryId;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input value={query} onChange={e => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
            placeholder="Search jobs, skills, companies..." className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${showFilters ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'}`}>
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Filters</span>
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300">Clear all</button>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Job Type</label>
              <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white">
                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Pricing</label>
              <select value={pricingType} onChange={e => setPricingType(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white">
                {PRICING.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white">
                <option value="">All Categories</option>
                {categories.map((c) => {
                  const sym = categoryIconPlainText(c.icon);
                  return (
                    <option key={c.id} value={c.id}>
                      {sym ? `${sym} ` : ''}{c.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        {['remote', 'on_site', 'hybrid'].map(t => (
          <button key={t} onClick={() => setJobType(prev => prev === t ? '' : t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${jobType === t ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'}`}>
            {{ remote: 'Remote', on_site: 'On-site', hybrid: 'Hybrid' }[t]}
          </button>
        ))}
        {['hourly', 'fixed_price'].map(t => (
          <button key={t} onClick={() => setPricingType(prev => prev === t ? '' : t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${pricingType === t ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'}`}>
            {t === 'hourly' ? 'Hourly' : 'Fixed Price'}
          </button>
        ))}
        {(hasFilters || query) && (
          <button onClick={clearFilters} className="text-xs px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-400">No jobs found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <JobCard job={job} user={user} onClick={() => navigate(`/dashboard/job/${job.id}`)} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
