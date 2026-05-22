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
			if (!token) {
				setError('Not authenticated');
				return;
			}
			const res = await axios.get(`/api/ai/insights/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } });
			const data = res.data?.insights || res.data;
			setInsights(data);
			setLastRequested(Date.now());
		} catch (err) {
			const status = err.response?.status;
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

	const downloadPDF = () => {
		const token = localStorage.getItem('token');
		const base = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:5000' : '');
		window.open(`${base}/api/analytics/report/${repo.owner}/${repo.name}?token=${token}`, '_blank');
	};

	if (!repo) return null;

	const renderList = (items) => (
		<ul className="mt-3 space-y-2">
			{items.map((item, index) => {
				let content;
				if (typeof item === 'string') {
					content = item;
				} else if (typeof item === 'object' && item !== null) {
					if (item.contributor) {
						content = <><span className="font-semibold text-slate-900 dark:text-white">{item.contributor}:</span> {item.insight || item.activity || ''}</>;
					} else if (item.risk) {
						content = <><span className="font-semibold text-slate-900 dark:text-white">{item.risk}:</span> {item.consequence || ''}</>;
					} else if (item.issue) {
						content = (
							<div className="flex flex-col gap-1">
								<span className="font-semibold text-slate-900 dark:text-white">{item.issue}</span>
								{item.impact && <span className="text-xs text-slate-600 dark:text-slate-400">Impact: {item.impact}</span>}
								{item.solution && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Action: {item.solution}</span>}
							</div>
						);
					} else {
						content = Object.entries(item).map(([k,v]) => `${k}: ${v}`).join(' | ');
					}
				} else {
					content = String(item);
				}

				return (
					<li key={index} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
						<span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 shrink-0" />
						<div className="flex-1">{content}</div>
					</li>
				);
			})}
		</ul>
	);

	return (
		<section className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
			<div className="flex items-center justify-between gap-4">
				<div>
					<div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI Insights</div>
					<h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Repository intelligence</h2>
				</div>
				<div className="flex gap-2">
					{insights && (
						<button onClick={downloadPDF} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
							Download PDF
						</button>
					)}
					<button onClick={generateInsights} disabled={loadingAI} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
						{loadingAI ? 'Generating insights...' : 'Generate AI Insights'}
					</button>
				</div>
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
									<div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
										{typeof parsed.technicalRisks[0] === 'string' 
											? parsed.technicalRisks[0] 
											: parsed.technicalRisks[0].risk || parsed.technicalRisks[0].issue || 'Review needed'}
									</div>
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
