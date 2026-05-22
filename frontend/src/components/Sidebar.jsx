import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white/50 px-4 py-8 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50 md:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
          DT
        </div>
        <span className="font-semibold tracking-wide text-slate-900 dark:text-white">DevTrackr</span>
      </div>
      
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        <Link to="/" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive('/') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'}`}>
          Dashboard
        </Link>
        <Link to="/repo" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive('/repo') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'}`}>
          Repositories
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        {token ? (
          <>
            <Link to="/profile" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive('/profile') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'}`}>
              Profile
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900">
              Log in
            </Link>
            <Link to="/signup" className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
              Sign up
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
