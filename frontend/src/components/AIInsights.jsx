import React, { useState } from 'react'
import axios from '../api/axios'
import { InsightSkeleton } from './Skeletons'

export default function AIInsights({ repo }){
	const [insights, setInsights] = useState(null);
	const [loadingAI, setLoadingAI] = useState(false);
	const [error, setError] = useState(null);
	const [lastRequested, setLastRequested] = useState(null);
	const COOLDOWN = 30; // seconds

	const generateInsights = async () => {
		if (!repo) return;
		if (loadingAI) return;
		const now = Date.now();
		if (lastRequested && (now - lastRequested) < COOLDOWN * 1000) {
			const wait = Math.ceil((COOLDOWN * 1000 - (now - lastRequested)) / 1000);
			setError(`Please wait ${wait}s before requesting insights again.`);
			return;
		}
		setLoadingAI(true);
		setError(null);
		try {
			const token = localStorage.getItem('token');
			const call = token
				? axios.get(`/api/ai/insights/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } })
				: axios.get(`/dev/ai/${repo.owner}/${repo.name}`);
			const res = await call;
			const data = res.data?.insights || res.data;
			setInsights(data);
			setLastRequested(Date.now());
		} catch (err) {
			const status = err.response?.status;
			if (status === 401) {
				// try dev fallback
				try {
					const dev = await axios.get(`/dev/ai/${repo.owner}/${repo.name}`);
					setInsights(dev.data?.insights || dev.data);
					setLastRequested(Date.now());
					return;
				} catch (e) {
					setError(e.response?.data?.error || e.message);
					return;
				}
			}
			if (status === 429 || /quota|RetryInfo/i.test(JSON.stringify(err.response?.data || ''))) {
				const retryInfo = err.response?.data?.[2]?.retryDelay || null;
				setError(retryInfo ? `AI temporarily unavailable. Retry in ${retryInfo}.` : 'AI temporarily unavailable. Please try again later.');
				return;
			}
			setError(err.response?.data?.error || err.message);
		} finally {
			setLoadingAI(false);
		}
	}

	if (!repo) return null;

	const renderList = (items) => (
		<ul className="mt-3 space-y-2">
			{items.map((item, index) => (
				<li key={index} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
					<span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 shrink-0" />
					<span>{item}</span>
				</li>
			))}
		</ul>
	);

	return (
		<section className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
			<div className="flex items-center justify-between gap-4">
				<div>
					<div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI Insights</div>
					<h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Repository intelligence</h2>
				</div>
				<button onClick={generateInsights} disabled={loadingAI} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
					{loadingAI ? 'Generating insights...' : 'Generate AI Insights'}
				</button>
			</div>

			{error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">AI Error: {error}</div>}

			{!insights && !loadingAI && (
				<div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
					Click <span className="font-semibold text-slate-900 dark:text-white">Generate AI Insights</span> to analyze this repository.
				</div>
			)}

			{loadingAI && <div className="mt-4"><InsightSkeleton /></div>}

			{insights && (() => {
				// Defensive parsing: sometimes Gemini returns a code-fenced JSON string
				let parsed = insights;
				if (typeof parsed === 'string') {
					try { parsed = JSON.parse(parsed); } catch (e) {
						try {
							const cleaned = parsed.replace(/```json/g, '').replace(/```/g, '').trim();
							parsed = JSON.parse(cleaned);
						} catch (e2) { parsed = { summary: parsed }; }
					}
				}
				if (parsed && typeof parsed.summary === 'string' && parsed.summary.trim().startsWith('{')) {
					try { parsed = JSON.parse(parsed.summary); } catch (e) { /* ignore */ }
				}
				const { summary, bottlenecks = [], recommendations = [], contributorInsights = [] } = parsed;

				return (
					<div className="mt-6 space-y-6">
						<div className="grid gap-3 sm:grid-cols-3">
							{parsed.projectHealth && (
								<div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
									<div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Project Health</div>
									<div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{parsed.projectHealth}</div>
								</div>
							)}
							{parsed.sprintStatus && (
								<div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4 dark:border-cyan-900/50 dark:bg-cyan-950/30">
									<div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">Sprint Status</div>
									<div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{parsed.sprintStatus}</div>
								</div>
							)}
							{Array.isArray(parsed.technicalRisks) && parsed.technicalRisks.length > 0 && (
								<div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 dark:border-amber-900/50 dark:bg-amber-950/30">
									<div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Technical Risks</div>
									<div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{parsed.technicalRisks[0]}</div>
								</div>
							)}
						</div>

						{summary && (
							<div>
								<div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sprint Summary</div>
								<p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{summary}</p>
							</div>
						)}

						{bottlenecks.length > 0 && (
							<div>
								<div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bottlenecks</div>
								{renderList(bottlenecks)}
							</div>
						)}

						{recommendations.length > 0 && (
							<div>
								<div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recommendations</div>
								{renderList(recommendations)}
							</div>
						)}

						{contributorInsights.length > 0 && (
							<div>
								<div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contributor Insights</div>
								{renderList(contributorInsights)}
							</div>
						)}
					</div>
				);
			})()}
		</section>
	);
}
