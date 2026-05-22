import React, { useEffect, useState } from 'react'
import axios from '../api/axios'

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

  if (loading) return <div>Loading repositories...</div>
  if (error) return <div style={{color:'red'}}>Error: {error}</div>
  if (!repos || repos.length === 0) return <div>No repositories found.</div>

  return (
    <div>
      <h3>Your Repositories</h3>
      <ul>
        {repos.map(r => (
          <li key={r.id} style={{padding: '6px 0'}}>
            <strong>{r.full_name}</strong> — {r.private ? 'Private' : 'Public'}
          </li>
        ))}
      </ul>
    </div>
  )
}
