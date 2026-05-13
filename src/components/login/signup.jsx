import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employer",
    profile: {
      bio: "",
      companyName: "",
      companyWebsite: "",
    },
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!API_BASE_URL) {
        setMessage("Set REACT_APP_API_URL in .env to your API base URL.");
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (response.ok) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(
          data.msg || data.message || `Registration failed (${response.status})`
        );
      }
    } catch (error) {
      const isNetwork =
        error?.message === "Failed to fetch" || error?.name === "TypeError";
      setMessage(
        isNetwork
          ? "Cannot reach the API server. Start the backend or check REACT_APP_API_URL in .env."
          : (error?.message || "Something went wrong. Please try again.")
      );
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 px-4 overflow-hidden relative py-8">
      {/* Animated floating orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-500/30 to-emerald-500/30 blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-500/30 to-teal-500/30 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-1.5s' }}></div>

      {/* Signup card */}
      <div className="relative glass rounded-3xl p-8 sm:p-10 w-full max-w-2xl flex flex-col items-center z-10 animate-fade-in border-glow">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-400 to-emerald-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-teal-500/40 shadow-xl">
              <img 
                src="/logo.png" 
                alt="Workky Logo" 
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2 text-center">
            Join Workky
          </h1>
          <p className="text-slate-400 text-base sm:text-lg text-center">
            Create your employer account
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 w-full text-center text-base font-medium px-4 py-3 rounded-xl border transition duration-300 ${
              message.includes("successful")
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Basic Information Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition"
              />
            </div>
          </div>

          {/* Business Information Section */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  name="profile.companyName"
                  value={formData.profile.companyName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Business Website <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="profile.companyWebsite"
                  value={formData.profile.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Business Bio
                </label>
                <textarea
                  name="profile.bio"
                  value={formData.profile.bio}
                  onChange={handleChange}
                  placeholder="Brief description about your business"
                  rows="3"
                  className="w-full text-base px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transform transition duration-300 ${
              loading
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 hover:shadow-glow hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-base">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-teal-400 hover:text-emerald-400 font-semibold transition"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-slate-600 text-sm text-center">
          © 2026 Workky Employer Portal
        </p>
      </div>
    </main>
  );
};

export default Signup;
