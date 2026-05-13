import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await AuthAPI.login({ email, password });
      const user = await AuthAPI.getProfile();
      if (user.role !== 'job_seeker') {
        AuthAPI.logout();
        setMessage('This portal is for job seekers only. Employers should use the employer portal.');
        setLoading(false);
        return;
      }
      onLogin(user);
      setMessage('Login successful!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setMessage(err.response?.data?.msg || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 px-4 overflow-hidden relative">
      <div className="absolute top-[-15%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-500/30 to-emerald-500/30 blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-500/30 to-teal-500/30 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-[50%] left-[50%] w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-1.5s' }}></div>

      <div className="relative glass rounded-3xl p-8 sm:p-10 w-full max-w-lg flex flex-col items-center z-10 animate-fade-in border-glow">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-400 to-emerald-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-teal-500/40 shadow-xl">
              <svg className="w-14 h-14 text-teal-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2 text-center">Workky Job Seeker</h1>
          <p className="text-slate-400 text-base sm:text-lg text-center">Sign in to find your dream job</p>
        </div>

        {message && (
          <div className={`mb-6 w-full text-center text-base font-medium px-4 py-3 rounded-xl border transition duration-300 ${
            message.includes('successful') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-base font-semibold text-slate-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required autoFocus
              className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required
              className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition" />
          </div>
          <button type="submit" disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transform transition duration-300 ${
              loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 hover:shadow-glow hover:scale-[1.02]'
            }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-base">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-teal-400 hover:text-emerald-400 font-semibold transition">Sign Up</button>
          </p>
        </div>
        <p className="mt-6 text-slate-600 text-sm text-center">&copy; 2026 Workky Job Portal</p>
      </div>
    </main>
  );
};

export default Login;
