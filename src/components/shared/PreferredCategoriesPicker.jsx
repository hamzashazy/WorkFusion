import React, { useState, useEffect } from 'react';
import { CategoriesAPI, categoryIconPlainText } from '../../services/api';

/**
 * Main category → subcategory dropdowns (data from API).
 * Emits list of subcategory (or parent) ObjectIds for profile.preferredCategories.
 */
export default function PreferredCategoriesPicker({ picks, onPicksChange, disabled }) {
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [parentError, setParentError] = useState('');

  const [selectedParentId, setSelectedParentId] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingParents(true);
      setParentError('');
      try {
        const list = await CategoriesAPI.getParents();
        if (!cancelled) setParents(list || []);
      } catch {
        if (!cancelled) {
          setParents([]);
          setParentError('Could not load categories. Check API URL and backend.');
        }
      } finally {
        if (!cancelled) setLoadingParents(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedParentId) {
      setSubcategories([]);
      setSelectedSubId('');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSubs(true);
      setSelectedSubId('');
      try {
        const subs = await CategoriesAPI.getSubcategories(selectedParentId);
        if (!cancelled) setSubcategories(subs || []);
      } catch {
        if (!cancelled) setSubcategories([]);
      } finally {
        if (!cancelled) setLoadingSubs(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedParentId]);

  const parentName = (id) => parents.find((p) => p.id === id)?.name || '';

  const addSelection = () => {
    if (!selectedParentId) return;

    if (subcategories.length > 0) {
      if (!selectedSubId) return;
      const sub = subcategories.find((s) => s.id === selectedSubId);
      if (!sub) return;
      const label = `${parentName(selectedParentId)} › ${sub.name}`;
      if (picks.some((p) => p.id === sub.id)) return;
      onPicksChange([...picks, { id: sub.id, label }]);
      setSelectedSubId('');
      return;
    }

    if (picks.some((p) => p.id === selectedParentId)) return;
    const label = `${parentName(selectedParentId)} (general)`;
    onPicksChange([...picks, { id: selectedParentId, label }]);
  };

  const removeAt = (index) => {
    onPicksChange(picks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Choose a main category, then a specialty. Subcategories come from your job portal database.
      </p>

      {parentError && (
        <p className="text-sm text-rose-400">{parentError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Main category</label>
          <select
            value={selectedParentId}
            disabled={disabled || loadingParents}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="">{loadingParents ? 'Loading…' : 'Select a category'}</option>
            {parents.map((p) => {
              const sym = categoryIconPlainText(p.icon);
              return (
              <option key={p.id} value={p.id}>
                {sym ? `${sym} ` : ''}{p.name}
              </option>
            );})}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Subcategory</label>
          <select
            value={selectedSubId}
            disabled={disabled || !selectedParentId || loadingSubs || subcategories.length === 0}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50"
          >
            <option value="">
              {!selectedParentId
                ? 'Select main category first'
                : loadingSubs
                  ? 'Loading…'
                  : subcategories.length === 0
                    ? 'No subcategories — use Add for broad field'
                    : 'Select a subcategory'}
            </option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || !selectedParentId || (subcategories.length > 0 && !selectedSubId)}
        onClick={addSelection}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {subcategories.length === 0 && selectedParentId ? 'Add main category' : 'Add to preferences'}
      </button>

      {picks.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {picks.map((p, i) => (
            <li
              key={`${p.id}-${i}`}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-sm text-teal-200"
            >
              <span className="truncate max-w-[220px]">{p.label}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(i)}
                className="text-teal-400/80 hover:text-rose-400 p-0.5 rounded"
                aria-label="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
