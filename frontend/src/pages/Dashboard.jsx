import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import CommitChart from '../components/CommitChart'
import ConnectGitHub from '../components/ConnectGitHub'
import RepoSelector from '../components/RepoSelector'
import axios from '../api/axios'

export default function Dashboard(){
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [pulls, setPulls] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = async (repo) => {
    setSelectedRepo(repo);
    setError(null);
    if (!repo) { setCommits([]); setPulls([]); setIssues([]); return; }
    const token = localStorage.getItem('token');
    if (!token) { setError('Not authenticated'); return; }

    setLoading(true);
    try {
      const [commitsRes, pullsRes, issuesRes] = await Promise.all([
        axios.get(`/api/github/commits/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/github/pulls/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/github/issues/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setCommits(commitsRes.data.commits || []);
      setPulls(pullsRes.data.pulls || []);
      setIssues(issuesRes.data.issues || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar/>
      <main className="p-4">
        <h1>Dashboard</h1>
        <div style={{margin: '12px 0', display: 'flex', gap: 12, alignItems: 'center'}}>
          <ConnectGitHub />
          <RepoSelector onSelect={handleSelect} />
        </div>

        {error && <div style={{color:'red'}}>Error: {error}</div>}

        {selectedRepo && (
          <div style={{display:'flex', gap:20, marginTop:12}}>
            <div style={{padding:12, border:'1px solid #ddd'}}>
              <strong>Total Commits</strong>
              <div>{commits.length}</div>
            </div>
            <div style={{padding:12, border:'1px solid #ddd'}}>
              <strong>Open PRs</strong>
              <div>{pulls.filter(p=>p.state==='open').length}</div>
            </div>
            <div style={{padding:12, border:'1px solid #ddd'}}>
              <strong>Open Issues</strong>
              <div>{issues.filter(i=>i.state==='open' && !i.pull_request).length}</div>
            </div>
          </div>
        )}

        {loading ? <div>Loading repo data...</div> : <CommitChart commits={commits} />}
      </main>
    </div>
  )
}
