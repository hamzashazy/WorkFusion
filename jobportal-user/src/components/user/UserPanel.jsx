import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, FileText, User, Bookmark, LogOut, Menu, X, Briefcase, LayoutGrid } from 'lucide-react';

const NAV = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/dashboard/browse', icon: Search, label: 'Browse' },
  { path: '/dashboard/applications', icon: FileText, label: 'Applications' },
  { path: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
  { path: '/dashboard/portfolio', icon: LayoutGrid, label: 'My Portfolio' },
  { path: '/dashboard/profile', icon: User, label: 'Profile' },
];

function getPageTitle(pathname) {
  if (pathname.startsWith('/dashboard/job/')) return 'Job Details';
  if (pathname === '/dashboard/portfolio' || pathname.startsWith('/dashboard/portfolio/')) return 'My Portfolio';
  const nav = NAV.find(n =>
    n.path === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(n.path)
  );
  return nav?.label || 'Dashboard';
}

export default function UserPanel({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path) => { navigate(path); setMobileOpen(false); };

  return (
    <div className="flex h-screen bg-dark-deeper overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-dark border-r border-slate-800 flex-shrink-0">
        <SidebarInner user={user} isActive={isActive} onNav={handleNav} onLogout={onLogout} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed left-0 top-0 bottom-0 w-64 bg-dark border-r border-slate-800 z-50 lg:hidden">
              <SidebarInner user={user} isActive={isActive} onNav={handleNav} onLogout={onLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-dark border-b border-slate-800 flex items-center px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg font-semibold text-white">
            {getPageTitle(location.pathname)}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarInner({ user, isActive, onNav, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary-400" />
        </div>
        <span className="text-xl font-bold gradient-text">Workky</span>
      </div>

      <div className="px-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ path, icon: Icon, label }) => (
          <button key={path} onClick={() => onNav(path)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(path) ? 'bg-primary-500/15 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
