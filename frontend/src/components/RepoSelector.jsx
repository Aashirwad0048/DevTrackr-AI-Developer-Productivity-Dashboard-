import React, { useEffect, useState } from 'react'
import axios from '../api/axios'
import { SkeletonBlock } from './Skeletons'

export default function RepoSelector({ onSelect }){
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view repositories');
      setLoading(false);
      return;
    }
    axios.get('/api/github/repos', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRepos(res.data))
      .catch(err => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const idx = e.target.value;
    if (idx === '') return onSelect(null);
    const r = repos[parseInt(idx, 10)];
    if (!r) return onSelect(null);
    // support both GitHub API shape and local demo Repo shape
    if (r.full_name) return onSelect({ owner: r.owner.login || r.owner, name: r.name || r.repoName, full_name: r.full_name });
    return onSelect({ owner: r.owner, name: r.repoName, full_name: `${r.owner}/${r.repoName}` });
  }

  if (loading) return (
    <div className="w-64">
      <SkeletonBlock className="h-9 w-full" />
    </div>
  )
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>
  if (!repos || repos.length === 0) return <div className="text-sm text-slate-500">No repositories available.</div>

  return (
    <div className="w-full min-w-[15rem] md:w-72">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Repository</label>
      <select onChange={handleChange} defaultValue="" className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-[0_12px_40px_rgba(15,23,42,0.08)] outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
        <option value="">-- Select repository --</option>
        {repos.map((r, i) => (
          <option key={r.id || r._id || i} value={i}>{r.full_name || `${r.owner}/${r.repoName}`}</option>
        ))}
      </select>
    </div>
  )
}
