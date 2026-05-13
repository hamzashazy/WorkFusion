import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, Trash2, Link as LinkIcon, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { AuthAPI } from '../../services/api';

const MAX_PROJECTS = 25;

function mapUserProjects(user) {
  return (user?.projects || []).map((p) => ({
    id: p.id,
    title: p.title || '',
    description: p.description || '',
    projectUrl: p.projectUrl || '',
    role: p.role || '',
    skills: p.skills || '',
  }));
}

/**
 * Portfolio projects — stored on the user profile via PUT /auth/profile (profile.projects).
 */
export default function MyPortfolio({ user, onUpdate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const fresh = await AuthAPI.getProfile();
        if (!cancelled) {
          onUpdate(fresh);
          setProjects(mapUserProjects(fresh));
        }
      } catch {
        if (!cancelled && user) setProjects(mapUserProjects(user));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally load once on mount; parent refreshes user after saves from this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProject = (index, field, value) => {
    setProjects((list) => {
      const next = [...list];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeProject = (index) => {
    setProjects((list) => list.filter((_, i) => i !== index));
  };

  const addProject = () => {
    if (projects.length >= MAX_PROJECTS) return;
    setProjects((list) => [
      ...list,
      {
        id: `new-${Date.now()}`,
        title: '',
        description: '',
        projectUrl: '',
        role: '',
        skills: '',
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const projectsPayload = projects.map(({ id, title, description, projectUrl, role, skills }) => ({
        id,
        title,
        description,
        projectUrl,
        role,
        skills,
      }));
      const updated = await AuthAPI.updateProfile({ projects: projectsPayload });
      onUpdate(updated);
      setProjects(mapUserProjects(updated));
      setMsg({ text: 'Portfolio saved to your account.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || err.message || 'Could not save', type: 'error' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin mb-3 opacity-60" />
        <p className="text-sm">Loading portfolio from server…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {msg.text && (
        <div
          className={`p-3 rounded-lg text-sm ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {msg.text}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-primary-400 mb-2">
              <LayoutGrid className="w-6 h-6" />
              <span className="text-xs font-semibold uppercase tracking-wider">My portfolio</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Projects & work samples</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              Everything here is saved to your profile on the server. When you apply to a job, you can select up to five of these
              projects to showcase to the employer.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={addProject}
              disabled={saving || projects.length >= MAX_PROJECTS}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500/15 border border-primary-500/35 text-primary-300 text-sm font-medium hover:bg-primary-500/25 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Add project
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save to server'}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          {projects.length} / {MAX_PROJECTS} projects · Only entries with a title are stored after save.
        </p>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-600 bg-slate-800/20 py-16 text-center">
            <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">No projects yet. Add your first piece of work.</p>
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600"
            >
              <Plus className="w-4 h-4" /> Add project
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {projects.map((proj, index) => (
              <div
                key={proj.id || index}
                className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    disabled={saving}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                    aria-label="Remove project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={proj.title}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                  placeholder="Project title *"
                  className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-primary-500"
                />
                <input
                  value={proj.role}
                  onChange={(e) => updateProject(index, 'role', e.target.value)}
                  placeholder="Your role (e.g. Full-stack developer)"
                  className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-primary-500"
                />
                <input
                  value={proj.skills}
                  onChange={(e) => updateProject(index, 'skills', e.target.value)}
                  placeholder="Skills / tools (comma-separated)"
                  className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-primary-500"
                />
                <textarea
                  value={proj.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Describe the work, impact, technologies, and outcomes…"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 resize-y focus:border-primary-500 leading-relaxed"
                />
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={proj.projectUrl}
                    onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                    placeholder="https://… (live demo, repo, or case study)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-primary-500"
                  />
                </div>
                {proj.projectUrl?.trim().startsWith('http') && (
                  <a
                    href={proj.projectUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700/60 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving…' : 'Save portfolio'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
