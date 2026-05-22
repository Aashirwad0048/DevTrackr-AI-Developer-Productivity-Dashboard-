import React, { useEffect, useState } from 'react'
import axios from '../api/axios'
import { SkeletonBlock } from './Skeletons'

export default function RepoList(){
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated — please login first');
      return;
    }
    setLoading(true);
    axios.get('/api/github/repos', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRepos(res.data))
      .catch(err => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">GitHub Integration</div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Your Repositories</h2>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          Error: {error}
        </div>
      )}

      {!loading && !error && (!repos || repos.length === 0) && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          No repositories found.
        </div>
      )}

      {!loading && !error && repos && repos.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((r, i) => (
            <li key={r.id || r._id || i} className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80">
              <div className="flex items-start justify-between">
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {r.name || r.repoName || (r.full_name ? r.full_name.split('/')[1] : 'Unknown')}
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    {r.owner?.login || r.owner || (r.full_name ? r.full_name.split('/')[0] : '')}
                  </span>
                </div>
                <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${r.private ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                  {r.private ? 'Private' : 'Public'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
