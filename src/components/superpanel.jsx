import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import JobPost from "./employer/JobPost.jsx";
import JobList from "./employer/JobList.jsx";
import JobDetail from "./employer/JobDetail.jsx";
import EmployerProfile from "./employer/EmployerProfile.jsx";
import ApplicationList from "./employer/ApplicationList.jsx";

const Superpanel = ({ defaultModule }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Determine active module from URL path
  const getActiveModuleFromPath = () => {
    const path = location.pathname;
    if (path.includes("/job/") && path.includes("/applications")) return "applicationlist";
    if (path.includes("/job/")) return "jobdetail";
    if (path.includes("/post-job")) return "postjob";
    if (path.includes("/my-jobs")) return "myjobs";
    if (path.includes("/profile")) return "profile";
    return "dashboard";
  };

  const activeModule = defaultModule || getActiveModuleFromPath();

  const modules = [
    {
      key: "postjob",
      title: "Post Job",
      icon: <PlusCircle className="w-6 h-6" />,
      path: "/dashboard/post-job",
      gradient: "from-teal-500 to-emerald-500",
      description: "Create and publish new job listings for your business.",
    },
    {
      key: "myjobs",
      title: "My Jobs",
      icon: <Briefcase className="w-6 h-6" />,
      path: "/dashboard/my-jobs",
      gradient: "from-cyan-500 to-teal-500",
      description: "View and manage all your posted job listings.",
    },
    {
      key: "profile",
      title: "Profile",
      icon: <User className="w-6 h-6" />,
      path: "/dashboard/profile",
      gradient: "from-emerald-500 to-green-500",
      description: "Update your business profile and account information.",
    },
  ];

  const handleNavigate = (module) => {
    setSidebarOpen(false);
    if (module === "dashboard") {
      navigate("/dashboard");
    } else {
      const mod = modules.find(m => m.key === module);
      if (mod) {
        navigate(mod.path);
      }
    }
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const renderDashboard = () => (
    <div className="flex flex-col items-center w-full px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4">
          Welcome Back
        </h2>
        <p className="text-slate-400 text-lg">
          Manage your job postings and find the perfect candidates
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {modules.map((mod, index) => (
          <motion.div
            key={mod.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(mod.path)}
            className="relative group glass rounded-2xl p-6 cursor-pointer overflow-hidden card-hover"
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Icon */}
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${mod.gradient} mb-4 shadow-glow`}>
              <span className="text-white">{mod.icon}</span>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
              {mod.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {mod.description}
            </p>
            
            {/* Arrow indicator */}
            <div className="flex items-center text-teal-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Open</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderModule = () => {
    if (activeModule === "dashboard") return renderDashboard();
    if (activeModule === "jobdetail") {
      return (
        <JobDetail 
          job={selectedJob}
          jobId={params.jobId}
          onBack={() => navigate("/dashboard/my-jobs")}
          onJobUpdated={(updatedJob) => {
            setSelectedJob(updatedJob);
          }}
          onJobDeleted={() => {
            navigate("/dashboard/my-jobs");
            setSelectedJob(null);
          }}
          onViewApplications={(job) => {
            setSelectedJob(job);
            navigate(`/dashboard/job/${job._id}/applications`);
          }}
        />
      );
    }
    if (activeModule === "applicationlist") {
      return (
        <ApplicationList
          jobId={params.jobId || selectedJob?._id}
          jobTitle={selectedJob?.title}
          onBack={() => {
            const jobId = selectedJob?._id || params.jobId;
            navigate(`/dashboard/job/${jobId}`);
          }}
        />
      );
    }
    if (activeModule === "postjob") {
      return <JobPost onSuccess={() => navigate("/dashboard/my-jobs")} />;
    }
    if (activeModule === "myjobs") {
      return (
        <JobList 
          onViewJob={(job) => {
            setSelectedJob(job);
            navigate(`/dashboard/job/${job._id}`);
          }}
          onEditJob={(job) => {
            setSelectedJob(job);
            navigate(`/dashboard/job/${job._id}`);
          }}
        />
      );
    }
    if (activeModule === "profile") {
      return <EmployerProfile />;
    }
    return renderDashboard();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo - Clickable */}
      <div 
        onClick={handleLogoClick}
        className="flex items-center gap-3 mb-10 px-2 cursor-pointer hover:opacity-90 transition-all group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-xl border border-teal-500/30">
            <img 
              src="/logo.png" 
              alt="Workky logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>
        <span className="font-bold text-xl gradient-text">Workky</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        <button
          onClick={() => handleNavigate("dashboard")}
          className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
            activeModule === "dashboard"
              ? "bg-teal-500/20 text-teal-400"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {activeModule === "dashboard" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-teal-400 to-emerald-400 rounded-r-full"></span>
          )}
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="font-medium">Dashboard</span>
        </button>

        {modules.map((mod) => (
          <button
            key={mod.key}
            onClick={() => handleNavigate(mod.key)}
            className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
              activeModule === mod.key
                ? "bg-teal-500/20 text-teal-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {activeModule === mod.key && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-teal-400 to-emerald-400 rounded-r-full"></span>
            )}
            <span className="shrink-0">{mod.icon}</span>
            <span className="font-medium">{mod.title}</span>
          </button>
        ))}
      </nav>

      {/* Logout button */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLogged");
            navigate("/login");
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 glass-dark p-6 md:sticky top-0 h-screen border-r border-slate-800/50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 glass-dark border-b border-slate-800/50">
        <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-1.5 rounded-lg border border-teal-500/30">
              <img src="/logo.png" alt="Workky logo" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <span className="font-bold text-lg gradient-text">Workky</span>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 glass-dark z-50 p-6 border-r border-slate-800/50 md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto pt-16 md:pt-0">
        {renderModule()}
      </main>
    </div>
  );
};

export default Superpanel;
