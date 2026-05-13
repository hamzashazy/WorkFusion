import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../services/api';
import PreferredCategoriesPicker from '../shared/PreferredCategoriesPicker';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    profile: { bio: '', resume: '', preferredJobTypes: [] },
  });
  const [categoryPicks, setCategoryPicks] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleJobType = (type) => {
    setFormData(prev => {
      const current = prev.profile.preferredJobTypes;
      const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, profile: { ...prev.profile, preferredJobTypes: updated } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.name || !formData.email || !formData.password) return setMessage('Please fill in all required fields');
    if (formData.password.length < 6) return setMessage('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) return setMessage('Passwords do not match');

    setLoading(true);
    try {
      await AuthAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'job_seeker',
        bio: formData.profile.bio,
        resume: formData.profile.resume,
        preferredJobTypes: formData.profile.preferredJobTypes,
        preferredCategories: categoryPicks.map((p) => p.id),
      });
      const user = await AuthAPI.getProfile();
      onLogin(user);
      setMessage('Registration successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setMessage(err.response?.data?.msg || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    { value: 'remote', label: 'Remote', icon: '🌍' },
    { value: 'on_site', label: 'On-site', icon: '🏢' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
  ];

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 px-4 overflow-hidden relative py-8">
      <div className="absolute top-[-15%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-500/30 to-emerald-500/30 blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-500/30 to-teal-500/30 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-1.5s' }}></div>

      <div className="relative glass rounded-3xl p-8 sm:p-10 w-full max-w-2xl flex flex-col items-center z-10 animate-fade-in border-glow">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-400 to-emerald-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-teal-500/40 shadow-xl">
              <svg className="w-14 h-14 text-teal-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2 text-center">Join WorkFusion</h1>
          <p className="text-slate-400 text-base sm:text-lg text-center">Create your job seeker account</p>
        </div>

        {message && (
          <div className={`mb-6 w-full text-center text-base font-medium px-4 py-3 rounded-xl border transition duration-300 ${
            message.includes('successful') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Account Information
            </h3>
            <div className="space-y-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name <span className="text-rose-400">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email <span className="text-rose-400">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Password <span className="text-rose-400">*</span></label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password <span className="text-rose-400">*</span></label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Profile Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Bio</label>
                <textarea name="profile.bio" value={formData.profile.bio} onChange={handleChange} placeholder="Tell employers about yourself..." rows="3" className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Resume Link <span className="text-slate-500 font-normal">(Optional)</span></label>
                <input type="url" name="profile.resume" value={formData.profile.resume} onChange={handleChange} placeholder="https://drive.google.com/your-resume" className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
              </div>
            </div>
          </div>

          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Job Preferences <span className="text-slate-500 font-normal text-sm ml-1">(Optional)</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Preferred Work Type</label>
                <div className="flex flex-wrap gap-3">
                  {jobTypes.map(type => {
                    const selected = formData.profile.preferredJobTypes.includes(type.value);
                    return (
                      <button key={type.value} type="button" onClick={() => toggleJobType(type.value)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${selected ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}>
                        <span className="text-lg">{type.icon}</span> {type.label}
                        {selected && <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Preferred categories</label>
                <PreferredCategoriesPicker picks={categoryPicks} onPicksChange={setCategoryPicks} disabled={loading} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transform transition duration-300 ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 hover:shadow-glow hover:scale-[1.02]'}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-base">Already have an account?{' '}<button type="button" onClick={() => navigate('/login')} className="text-teal-400 hover:text-emerald-400 font-semibold transition">Sign In</button></p>
        </div>
        <p className="mt-6 text-slate-600 text-sm text-center">&copy; 2026 WorkFusion Job Portal</p>
      </div>
    </main>
  );
};

export default Signup;
