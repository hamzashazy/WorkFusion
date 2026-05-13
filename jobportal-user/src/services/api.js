import axios from 'axios';

const envUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');

const PRODUCTION_API_BASE = 'https://workfusion-backend.vercel.app/api';

const API_BASE_URL =
  envUrl ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : PRODUCTION_API_BASE);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Data normalizers ──

export function normalizeJob(job) {
  if (!job) return null;
  return {
    id: job._id || job.id,
    title: job.title,
    description: job.description || '',
    categoryId: job.category?._id || job.category || '',
    categoryName: job.category?.name || '',
    parentCategoryId: job.parentCategory?._id || job.parentCategory || '',
    parentCategoryName: job.parentCategory?.name || '',
    jobType: job.jobType,
    pricingType: job.pricingType,
    hourlyRate: job.compensation?.hourly?.hourlyRate || 0,
    estimatedHours: job.compensation?.hourly?.estimatedHours || 0,
    totalBudget: job.compensation?.fixedPrice?.totalBudget || 0,
    estimatedDuration: job.compensation?.fixedPrice?.estimatedDuration || '',
    skillsRequired: job.skillsRequired || [],
    requirements: job.requirements || [],
    minYearsExp: job.experienceRequired?.minYears || 0,
    maxYearsExp: job.experienceRequired?.maxYears || 0,
    educationRequired: job.educationRequired || 'none',
    location: job.location || '',
    timezone: job.timezone || '',
    status: job.status || 'active',
    vacancies: job.vacancies || 1,
    employerId: job.employer?._id || job.employer || '',
    employerName: job.employer?.name || '',
    companyName: job.employer?.profile?.companyName || job.employer?.name || '',
    postedAt: job.postedAt,
  };
}

export function normalizeApplication(app) {
  if (!app) return null;
  return {
    id: app._id || app.id,
    jobId: app.job?._id || app.job || '',
    jobTitle: app.job?.title || '',
    companyName: app.job?.employer?.profile?.companyName || app.job?.employer?.name || '',
    applicantId: app.applicant?._id || app.applicant || '',
    coverMessage: app.coverMessage || '',
    resumeUrl: app.resumeUrl || '',
    portfolioUrl: app.portfolioUrl || '',
    showcasedProjects: Array.isArray(app.showcasedProjects)
      ? app.showcasedProjects.map((s) => ({
          title: s.title || '',
          description: s.description || '',
          projectUrl: s.projectUrl || '',
          role: s.role || '',
          skills: s.skills || '',
        }))
      : [],
    proposedRate: app.proposedRate || 0,
    availability: app.availability || 'flexible',
    status: app.status || 'applied',
    employerNotes: app.employerNotes || '',
    appliedAt: app.appliedAt,
    viewedAt: app.viewedAt,
  };
}

export function normalizeCategory(cat) {
  if (!cat) return null;
  return {
    id: cat._id || cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || '',
    parentId: cat.parent?._id || cat.parent || null,
    workMode: cat.workMode || 'online',
    isActive: cat.isActive !== false,
    order: cat.order || 0,
    children: (cat.children || []).map(normalizeCategory),
  };
}

/**
 * Category `icon` is often Font Awesome classes in the DB; those must not be shown as raw text.
 * Returns a short emoji/symbol string only, or '' when the value is a class name or URL.
 */
export function categoryIconPlainText(icon) {
  if (!icon || typeof icon !== 'string') return '';
  const t = icon.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return '';
  if (/\bfa[srlbd]?\b/i.test(t) || /\bfa-[\w-]+\b/i.test(t)) return '';
  if (/^(las|lar|lal|lab)\s/i.test(t)) return '';
  if (/\bmdi-[\w-]+\b/i.test(t)) return '';
  if (t.length > 12) return '';
  return t;
}

export function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.profile?.bio || '',
    resume: user.profile?.resume || '',
    portfolio: user.profile?.portfolio || '',
    projects: (user.profile?.projects || []).map((p) => ({
      id: String(p._id || p.id),
      title: p.title || '',
      description: p.description || '',
      projectUrl: p.projectUrl || '',
      role: p.role || '',
      skills: p.skills || '',
    })),
    preferredCategories: (user.profile?.preferredCategories || []).map(c =>
      typeof c === 'object' ? (c._id || c.id) : c
    ),
    preferredJobTypes: user.profile?.preferredJobTypes || [],
    companyName: user.profile?.companyName || '',
    createdAt: user.createdAt,
  };
}

// ── Auth API ──

export const AuthAPI = {
  async register({ name, email, password, role = 'job_seeker', bio, preferredJobTypes, preferredCategories, resume }) {
    const profile = {};
    if (bio) profile.bio = bio;
    if (resume) profile.resume = resume;
    if (preferredJobTypes?.length) profile.preferredJobTypes = preferredJobTypes;
    if (preferredCategories?.length) profile.preferredCategories = preferredCategories;

    const res = await api.post('/auth/register', {
      name, email, password, role,
      profile: Object.keys(profile).length > 0 ? profile : undefined,
    });
    const token = res.data.token;
    localStorage.setItem('token', token);
    return token;
  },

  async login({ email, password }) {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token;
    localStorage.setItem('token', token);
    return token;
  },

  logout() {
    localStorage.removeItem('token');
  },

  get isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return normalizeUser(res.data);
  },

  async updateProfile({ name, bio, resume, portfolio, projects, preferredJobTypes, preferredCategories }) {
    const profile = {};
    if (bio !== undefined) profile.bio = bio;
    if (resume !== undefined) profile.resume = resume;
    if (portfolio !== undefined) profile.portfolio = portfolio;
    if (projects !== undefined) profile.projects = projects;
    if (preferredJobTypes !== undefined) profile.preferredJobTypes = preferredJobTypes;
    if (preferredCategories !== undefined) profile.preferredCategories = preferredCategories;

    const res = await api.put('/auth/profile', {
      name,
      profile: Object.keys(profile).length > 0 ? profile : undefined,
    });
    return normalizeUser(res.data);
  },

  async changePassword({ currentPassword, newPassword }) {
    const res = await api.put('/auth/password', { currentPassword, newPassword });
    return res.data;
  },
};

// ── Jobs API ──

export const JobsAPI = {
  async getAll(params = {}) {
    const res = await api.get('/jobs', { params: { limit: 50, ...params } });
    return (res.data.data || []).map(normalizeJob);
  },

  async getById(id) {
    const res = await api.get(`/jobs/${id}`);
    return normalizeJob(res.data);
  },

  async search(query, filters = {}) {
    return this.getAll({ search: query, ...filters });
  },

  async getRecommended() {
    try {
      const res = await api.get('/jobs/recommended', { params: { limit: 10 } });
      return (res.data.data || []).map(normalizeJob);
    } catch {
      return this.getAll({ limit: 10 });
    }
  },
};

// ── Categories API ──

export const CategoriesAPI = {
  async getParents() {
    const res = await api.get('/categories/parents');
    return (Array.isArray(res.data) ? res.data : res.data.data || []).map(normalizeCategory);
  },

  async getAll() {
    const res = await api.get('/categories');
    return (Array.isArray(res.data) ? res.data : res.data.data || []).map(normalizeCategory);
  },

  async getSubcategories(parentId) {
    const res = await api.get(`/categories/${parentId}/subcategories`);
    return (Array.isArray(res.data) ? res.data : res.data.data || []).map(normalizeCategory);
  },

  /** Single category by Mongo ObjectId or slug (public). */
  async getById(id) {
    if (!id) return null;
    const res = await api.get(`/categories/${encodeURIComponent(id)}`);
    const raw = res.data?.data ?? res.data;
    if (!raw) return null;
    return normalizeCategory(raw);
  },
};

// ── Applications API ──

export const ApplicationsAPI = {
  async apply(jobId, { coverMessage, proposedRate, availability, resumeUrl, portfolioUrl, showcasedProjectIds }) {
    const res = await api.post(`/applications/${jobId}`, {
      coverMessage,
      proposedRate: proposedRate !== '' && proposedRate != null ? parseFloat(proposedRate, 10) : undefined,
      availability,
      resumeUrl: resumeUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      showcasedProjectIds: Array.isArray(showcasedProjectIds) ? showcasedProjectIds : [],
    });
    return normalizeApplication(res.data.data || res.data);
  },

  async getMy(statusFilter) {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const res = await api.get('/applications/my', { params });
    return (res.data.data || []).map(normalizeApplication);
  },

  async getStats() {
    const apps = await this.getMy();
    const count = (s) => apps.filter(a => a.status === s).length;
    return {
      total: apps.length,
      applied: count('applied'),
      viewed: count('viewed'),
      shortlisted: count('shortlisted'),
      interview: count('interview'),
      hired: count('hired'),
      rejected: count('rejected'),
      withdrawn: count('withdrawn'),
    };
  },

  async hasApplied(jobId) {
    const apps = await this.getMy();
    return apps.some(a => a.jobId === jobId);
  },

  async withdraw(appId) {
    const res = await api.put(`/applications/${appId}/withdraw`);
    return res.data;
  },
};

// ── Saved Jobs (localStorage only — no backend model) ──

const SAVED_KEY = 'workky_saved_jobs';

export const SavedJobsLocal = {
  _getMap() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || {}; } catch { return {}; }
  },

  getSavedIds(userId) {
    return this._getMap()[userId] || [];
  },

  isSaved(userId, jobId) {
    return this.getSavedIds(userId).includes(jobId);
  },

  toggle(userId, jobId) {
    const map = this._getMap();
    const list = map[userId] || [];
    map[userId] = list.includes(jobId) ? list.filter(id => id !== jobId) : [...list, jobId];
    localStorage.setItem(SAVED_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('storage-updated'));
    return map[userId];
  },

  async getSaved(userId) {
    const ids = this.getSavedIds(userId);
    if (ids.length === 0) return [];
    const jobs = [];
    for (const id of ids) {
      try {
        const job = await JobsAPI.getById(id);
        if (job) jobs.push(job);
      } catch { /* job may have been deleted */ }
    }
    return jobs;
  },
};
