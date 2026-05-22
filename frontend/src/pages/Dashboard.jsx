import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import CommitChart from '../components/CommitChart'
import ConnectGitHub from '../components/ConnectGitHub'
import RepoSelector from '../components/RepoSelector'
import axios from '../api/axios'
import AIInsights from '../components/AIInsights'
import PRChart from '../components/PRChart'
import IssueChart from '../components/IssueChart'

export default function Dashboard(){
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
      const res = await axios.get(`/api/analytics/repo/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(res.data);
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

        {selectedRepo && analytics && (
          <div style={{display:'flex', gap:20, marginTop:12}}>
            <div style={{padding:12, border:'1px solid #ddd'}}>
              <strong>Total Commits</strong>
              <div>{analytics.commitFrequency ? analytics.commitFrequency.reduce((s,d)=>s+d.count,0) : 0}</div>
            </div>
            <div style={{padding:12, border:'1px solid #ddd'}}>
              <strong>Open PRs</strong>
              <div>{analytics.prMetrics?.openPRs || 0}</div>
            </div>
            <div style={{padding:12, border:'1px solid #ddd'}}>
              <strong>Open Issues</strong>
              <div>{analytics.issueMetrics?.openIssues || 0}</div>
            </div>
          </div>
        )}

        {selectedRepo && (
          <AIInsights repo={selectedRepo} />
        )}
        {loading ? <div>Loading repo data...</div> : (
          analytics ? (
            <>
              <CommitChart data={analytics.commitFrequency} />
              <div style={{display:'flex', gap:20, marginTop:20}}>
                <PRChart prMetrics={analytics.prMetrics} />
                <IssueChart issueMetrics={analytics.issueMetrics} />
              </div>
            </>
          ) : <div>Select a repository to view analytics.</div>
        )}
      </main>
    </div>
  )
}
