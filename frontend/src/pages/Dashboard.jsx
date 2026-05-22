import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import CommitChart from '../components/CommitChart'
import ConnectGitHub from '../components/ConnectGitHub'
import RepoSelector from '../components/RepoSelector'
import axios from '../api/axios'
import AIInsights from '../components/AIInsights'
import PRChart from '../components/PRChart'
import IssueChart from '../components/IssueChart'
import { MetricCardSkeleton, ChartSkeleton, InsightSkeleton } from '../components/Skeletons'

export default function Dashboard(){
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [publicRepoInput, setPublicRepoInput] = useState('');

  const handleSelect = async (repo) => {
    setSelectedRepo(repo);
    setError(null);
    if (!repo) { setAnalytics(null); return; }
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

  const handlePublicAnalyze = (e) => {
    e.preventDefault();
    if (!publicRepoInput) {
      setError('Please enter a valid repository (e.g. facebook/react or https://github.com/facebook/react)');
      return;
    }

    let cleaned = publicRepoInput.trim();
    cleaned = cleaned.replace("https://github.com/", "").replace("http://github.com/", "");
    const parts = cleaned.split('/');

    if (parts.length < 2) {
      setError('Please enter a valid format: owner/repo (e.g. facebook/react)');
      return;
    }

    const owner = parts[0];
    const name = parts[1];
    handleSelect({ owner: owner.trim(), name: name.trim(), full_name: `${owner.trim()}/${name.trim()}` });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-col items-end gap-3 md:flex-row md:items-center">
            <form onSubmit={handlePublicAnalyze} className="flex w-full items-center gap-2 md:w-auto">
              <input 
                type="text" 
                placeholder="owner/repo (e.g., vercel/next.js)" 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 md:w-64"
                value={publicRepoInput}
                onChange={(e) => setPublicRepoInput(e.target.value)}
              />
              <button type="submit" className="shrink-0 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Analyze</button>
            </form>
            <div className="hidden h-6 w-px bg-slate-300 dark:bg-slate-700 md:block"></div>
            <div className="flex w-full items-center gap-3 md:w-auto">
              <ConnectGitHub />
              <RepoSelector onSelect={handleSelect} />
            </div>
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
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Total Commits</div>
                    <div className="mt-3 text-2xl font-bold">{analytics.commitFrequency ? analytics.commitFrequency.reduce((s,d)=>s+d.count,0) : 0}</div>
                  </div>
                  <div className="bg-primary-50 text-primary-600 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 8 4-16 3 8h4" /></svg>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Open PRs</div>
                    <div className="mt-3 text-2xl font-bold">{analytics.prMetrics?.openPRs || 0}</div>
                  </div>
                  <div className="bg-primary-50 text-primary-600 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M2 13a6 6 0 1111.996.225A4.5 4.5 0 0012.5 18H3a1 1 0 01-1-1v-3z" clipRule="evenodd"/></svg>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Open Issues</div>
                    <div className="mt-3 text-2xl font-bold">{analytics.issueMetrics?.openIssues || 0}</div>
                  </div>
                  <div className="bg-primary-50 text-primary-600 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.452 9.68A1.75 1.75 0 0116.98 15H3.02a1.75 1.75 0 01-1.713-2.221l5.45-9.68z" /></svg>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-1 md:col-span-3 text-sm text-slate-500">Select a repository to view analytics.</div>
              </>
            )
          )}
        </section>

        <section className="mt-8 flex flex-col gap-8">
          <div className="w-full">
            {loading ? <ChartSkeleton /> : analytics ? <CommitChart data={analytics.commitFrequency} /> : <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 text-sm text-slate-500">No chart data</div>}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <ChartSkeleton height="h-56" />
                  <ChartSkeleton height="h-56" />
                </>
              ) : analytics ? (
                <>
                  <PRChart prMetrics={analytics.prMetrics} />
                  <IssueChart issueMetrics={analytics.issueMetrics} />
                </>
              ) : null}
            </div>
          </div>

          <div className="w-full">
            {selectedRepo && <AIInsights repo={selectedRepo} />}
            {loading && !selectedRepo && <div className="mt-4"><InsightSkeleton /></div>}
          </div>
        </section>
        </main>
      </div>
    </div>
  )
}
