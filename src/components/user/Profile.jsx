import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, FileText, Link as LinkIcon, Save, Lock, ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import { AuthAPI, ApplicationsAPI, CategoriesAPI } from '../../services/api';
import PreferredCategoriesPicker from '../shared/PreferredCategoriesPicker';

export default function Profile({ user, onUpdate }) {
  const [form, setForm] = useState({
    name: '', bio: '', resume: '', portfolio: '',
    preferredJobTypes: [],
  });
  const [categoryPicks, setCategoryPicks] = useState([]);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', bio: user.bio || '', resume: user.resume || '', portfolio: user.portfolio || '',
        preferredJobTypes: user.preferredJobTypes || [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user?.preferredCategories?.length) {
      setCategoryPicks([]);
      return;
    }
    const ids = user.preferredCategories
      .map((c) => (typeof c === 'object' ? (c._id || c.id) : c))
      .filter(Boolean)
      .map((id) => String(id));

    let cancelled = false;
    (async () => {
      const picks = [];
      for (const id of ids) {
        try {
          const cat = await CategoriesAPI.getById(id);
          if (!cat || cancelled) continue;
          if (cat.parentId) {
            try {
              const par = await CategoriesAPI.getById(cat.parentId);
              picks.push({
                id: cat.id,
                label: par ? `${par.name} › ${cat.name}` : cat.name,
              });
            } catch {
              picks.push({ id: cat.id, label: cat.name });
            }
          } else {
            picks.push({ id: cat.id, label: `${cat.name} (general)` });
          }
        } catch {
          if (!cancelled) picks.push({ id, label: 'Saved category' });
        }
      }
      if (!cancelled) setCategoryPicks(picks);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (user) ApplicationsAPI.getStats().then(setStats).catch(() => {});
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await AuthAPI.updateProfile({
        name: form.name, bio: form.bio, resume: form.resume, portfolio: form.portfolio,
        preferredJobTypes: form.preferredJobTypes,
        preferredCategories: categoryPicks.map((p) => p.id),
      });
      onUpdate(updated);
      setMsg({ text: 'Profile updated!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleChangePw = async () => {
    if (!pwForm.current || !pwForm.newPw) return setMsg({ text: 'Fill all fields', type: 'error' });
    if (pwForm.newPw.length < 6) return setMsg({ text: 'Password must be at least 6 characters', type: 'error' });
    if (pwForm.newPw !== pwForm.confirm) return setMsg({ text: 'Passwords do not match', type: 'error' });
    try {
      await AuthAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setShowPwForm(false);
      setMsg({ text: 'Password changed!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || err.message, type: 'error' });
    }
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const projectCount = user?.projects?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {msg.text && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg.text}</div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-500/15 flex items-center justify-center text-primary-400 font-bold text-3xl mx-auto mb-4">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-sm text-slate-400">{user?.email}</p>
        {user?.bio && <p className="text-sm text-slate-500 mt-2">{user.bio}</p>}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Applied', value: stats.total || 0, color: 'text-primary-400' },
            { label: 'Shortlisted', value: stats.shortlisted || 0, color: 'text-amber-400' },
            { label: 'Hired', value: stats.hired || 0, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg bg-slate-800/50">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Edit Profile</h3>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary-500 transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input value={user?.email || ''} disabled className="w-full pl-11 pr-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-slate-500 cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Bio</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Tell employers about yourself..." className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:border-primary-500 transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Resume link</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input value={form.resume} onChange={e => set('resume', e.target.value)} placeholder="https://… (Drive, PDF, personal site)" className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Portfolio / website</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input value={form.portfolio} onChange={e => set('portfolio', e.target.value)} placeholder="https://… (GitHub, Behance, personal site)" className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-slate-800/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary-500/15 text-primary-400 shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Portfolio projects</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Case studies and work samples live in <strong className="text-slate-400">My Portfolio</strong> and sync to the server.
                You can attach up to five when you apply to a job.
                {projectCount > 0 && (
                  <span className="block mt-1 text-primary-400/90">{projectCount} saved {projectCount === 1 ? 'project' : 'projects'}</span>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/portfolio"
            className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-300 text-sm font-medium hover:bg-primary-500/30 transition-colors"
          >
            Open My Portfolio
          </Link>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Preferred Job Types</label>
          <div className="flex flex-wrap gap-2">
            {[{ v: 'remote', l: 'Remote' }, { v: 'on_site', l: 'On-site' }, { v: 'hybrid', l: 'Hybrid' }].map(t => (
              <button key={t.v} type="button" onClick={() => set('preferredJobTypes', toggleArr(form.preferredJobTypes, t.v))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.preferredJobTypes.includes(t.v) ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Preferred categories</label>
          <PreferredCategoriesPicker picks={categoryPicks} onPicksChange={setCategoryPicks} disabled={saving} />
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <button type="button" onClick={() => setShowPwForm(!showPwForm)} className="w-full flex items-center justify-between text-white">
          <span className="flex items-center gap-2 font-semibold"><Lock className="w-5 h-5" /> Change Password</span>
          {showPwForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {showPwForm && (
          <div className="mt-4 space-y-3">
            <input type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="Current password" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
            <input type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} placeholder="New password" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Confirm new password" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 transition-colors" />
            <button type="button" onClick={handleChangePw} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Update Password</button>
          </div>
        )}
      </div>
    </div>
  );
}
