import React, { useEffect, useState } from 'react'
import axios from '../api/axios'

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

  if (loading) return <div>Loading repositories...</div>
  if (error) return <div style={{color:'red'}}>Error: {error}</div>
  if (!repos || repos.length === 0) return <div>No repositories available.</div>

  return (
    <div>
      <label style={{display:'block', marginBottom:6}}>Select Repository:</label>
      <select onChange={handleChange} defaultValue="">
        <option value="">-- Select repository --</option>
        {repos.map((r, i) => (
          <option key={r.id} value={i}>{r.full_name}</option>
        ))}
      </select>
    </div>
  )
}
