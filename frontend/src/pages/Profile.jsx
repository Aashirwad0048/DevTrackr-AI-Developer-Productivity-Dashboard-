import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import axios from '../api/axios'

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        // Update cache with latest database values
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        // Graceful fallback to localStorage if the API endpoint isn't wired yet
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          setError('Failed to load profile data from database.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl p-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">User Profile</h1>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          ) : user ? (
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
              <div className="border-b border-slate-200/50 bg-slate-50/50 px-8 py-6 dark:border-slate-800/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your DevTrackr account</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8 p-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                    <div className="mt-2 flex h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                    <div className="mt-2 flex h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8 dark:border-slate-800">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Integrations</label>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">GitHub Connection</div>
                        <div className="text-xs text-slate-500">Required to fetch repository analytics</div>
                      </div>
                    </div>
                    <div>
                      {user.githubToken || user.githubConnected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Not Connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}