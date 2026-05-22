import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import CommitChart from '../components/CommitChart'
import ConnectGitHub from '../components/ConnectGitHub'
import RepoSelector from '../components/RepoSelector'
import axios from '../api/axios'
import AIInsights from '../components/AIInsights'
import PRChart from '../components/PRChart'
import IssueChart from '../components/IssueChart'
import { MetricCardSkeleton, ChartSkeleton } from '../components/Skeletons'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar/>
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <ConnectGitHub />
            <RepoSelector onSelect={handleSelect} />
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600">Error: {error}</div>}

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            selectedRepo && analytics ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-sm text-slate-500">Total Commits</div>
                  <div className="mt-3 text-2xl font-bold">{analytics.commitFrequency ? analytics.commitFrequency.reduce((s,d)=>s+d.count,0) : 0}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-sm text-slate-500">Open PRs</div>
                  <div className="mt-3 text-2xl font-bold">{analytics.prMetrics?.openPRs || 0}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-sm text-slate-500">Open Issues</div>
                  <div className="mt-3 text-2xl font-bold">{analytics.issueMetrics?.openIssues || 0}</div>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-1 md:col-span-3 text-sm text-slate-500">Select a repository to view analytics.</div>
              </>
            )
          )}
        </section>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? <ChartSkeleton /> : analytics ? <CommitChart data={analytics.commitFrequency} /> : <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">No data</div>}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <ChartSkeleton height="h-56" />
                  <ChartSkeleton height="h-56" />
                </>
              ) : (
                <>
                  <PRChart prMetrics={analytics?.prMetrics} />
                  <IssueChart issueMetrics={analytics?.issueMetrics} />
                </>
              )}
            </div>
          </div>

          <aside>
            {selectedRepo && <AIInsights repo={selectedRepo} />}
            {loading && !selectedRepo && <div className="mt-4"><InsightSkeleton /></div>}
          </aside>
        </section>
      </main>
    </div>
  )
}
