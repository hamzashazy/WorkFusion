import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, Star, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { JobsAPI, CategoriesAPI, ApplicationsAPI, categoryIconPlainText } from '../../services/api';
import JobCard from './JobCard';

export default function HomePage({ user }) {
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [catJobCounts, setCatJobCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, jobs, appStats] = await Promise.all([
          CategoriesAPI.getParents(),
          JobsAPI.getRecommended(),
          user ? ApplicationsAPI.getStats() : Promise.resolve({}),
        ]);
        setCategories(cats);
        setRecommended(jobs);
        setStats(appStats);

        const allJobs = await JobsAPI.getAll({ limit: 100 });
        const counts = {};
        cats.forEach(cat => {
          counts[cat.id] = allJobs.filter(j => j.categoryId === cat.id || j.parentCategoryId === cat.id).length;
        });
        setCatJobCounts(counts);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/dashboard/browse?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const statCards = [
    { label: 'Applied', value: stats.total || 0, icon: Briefcase, color: 'text-primary-400 bg-primary-500/15' },
    { label: 'Shortlisted', value: stats.shortlisted || 0, icon: Star, color: 'text-amber-400 bg-amber-500/15' },
    { label: 'Interviews', value: stats.interview || 0, icon: Users, color: 'text-cyan-400 bg-cyan-500/15' },
    { label: 'Hired', value: stats.hired || 0, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/15' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-primary-600/20 via-dark-card to-dark-card border border-primary-500/20 p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
          Hello, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-400 mb-6">Find your perfect opportunity today</p>
        <form onSubmit={handleSearch} className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs, skills, companies..." className="w-full pl-12 pr-4 py-3.5 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
        </form>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Categories</h2>
          <button onClick={() => navigate('/dashboard/browse')} className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">See all <ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.slice(0, 6).map(cat => (
            <button key={cat.id} onClick={() => navigate(`/dashboard/browse?cat=${cat.id}`)}
              className="glass rounded-xl p-4 text-left hover:border-primary-500/40 transition-all group">
              <span className="text-2xl">{categoryIconPlainText(cat.icon) || '📁'}</span>
              <p className="text-sm font-medium text-white mt-2 group-hover:text-primary-400 transition-colors">{cat.name}</p>
              <p className="text-xs text-slate-500">{catJobCounts[cat.id] || 0} jobs</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recommended for you</h2>
        {recommended.length === 0 ? (
          <p className="text-sm text-slate-500">No recommendations yet. Update your preferences in your profile.</p>
        ) : (
          <div className="space-y-3">
            {recommended.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <JobCard job={job} user={user} onClick={() => navigate(`/dashboard/job/${job.id}`)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
