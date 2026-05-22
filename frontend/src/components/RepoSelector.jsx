import React, { useEffect, useState } from 'react'
import axios from '../api/axios'
import { SkeletonBlock } from './Skeletons'

export default function RepoSelector({ onSelect }){
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Not authenticated'); return; }
    setLoading(true);
    axios.get('/api/github/repos', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRepos(res.data))
      .catch(err => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const idx = e.target.value;
    if (idx === '') return onSelect(null);
    const r = repos[parseInt(idx, 10)];
    if (!r) return onSelect(null);
    onSelect({ owner: r.owner.login, name: r.name, full_name: r.full_name });
  }

  if (loading) return (
    <div className="w-64">
      <SkeletonBlock className="h-9 w-full" />
    </div>
  )
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>
  if (!repos || repos.length === 0) return <div className="text-sm text-slate-500">No repositories available.</div>

  return (
    <div className="w-64">
      <label className="block text-sm text-slate-600 mb-1">Repository</label>
      <select onChange={handleChange} defaultValue="" className="w-full rounded-lg border border-slate-200 p-2 bg-white text-sm shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <option value="">-- Select repository --</option>
        {repos.map((r, i) => (
          <option key={r.id} value={i}>{r.full_name}</option>
        ))}
      </select>
    </div>
  )
}
