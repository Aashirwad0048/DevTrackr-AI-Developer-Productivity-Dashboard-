import React, { useEffect, useState } from 'react'
import axios from '../api/axios'
import { InsightSkeleton } from './Skeletons'

export default function AIInsights({ repo }){
	const [insights, setInsights] = useState(null);
	const [loadingAI, setLoadingAI] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!repo) { setInsights(null); return; }
		const token = localStorage.getItem('token');
		if (!token) { setError('Not authenticated'); return; }

		let mounted = true;
		setLoadingAI(true);
		setError(null);
		setInsights(null);

		axios.get(`/api/ai/insights/${repo.owner}/${repo.name}`, { headers: { Authorization: `Bearer ${token}` } })
			.then(res => {
				if (!mounted) return;
				const data = res.data?.insights || res.data;
				setInsights(data);
			})
			.catch(err => {
				if (!mounted) return;
				setError(err.response?.data?.error || err.message);
			})
			.finally(() => { if (mounted) setLoadingAI(false); });

		return () => { mounted = false; };
	}, [repo]);

	if (!repo) return null;
	if (loadingAI) return <div className="mt-4"><InsightSkeleton /></div>;
	if (error) return <div className="mt-4 text-sm text-red-600">AI Error: {error}</div>;
	if (!insights) return null;

	const { summary, bottlenecks = [], recommendations = [], contributorInsights = [] } = insights;

	return (
		<section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<h2 className="text-lg font-semibold">AI Insights</h2>
			{summary && (
				<div className="mt-3">
					<div className="text-sm text-slate-500">Sprint Summary</div>
					<p className="mt-2 text-sm">{summary}</p>
				</div>
			)}

			{bottlenecks.length > 0 && (
				<div className="mt-4">
					<div className="text-sm text-slate-500">Bottlenecks</div>
					<ul className="list-disc list-inside mt-2">
						{bottlenecks.map((b,i) => <li key={i} className="text-sm">{b}</li>)}
					</ul>
				</div>
			)}

			{recommendations.length > 0 && (
				<div className="mt-4">
					<div className="text-sm text-slate-500">Recommendations</div>
					<ul className="list-disc list-inside mt-2">
						{recommendations.map((r,i) => <li key={i} className="text-sm">{r}</li>)}
					</ul>
				</div>
			)}

			{contributorInsights.length > 0 && (
				<div className="mt-4">
					<div className="text-sm text-slate-500">Contributor Insights</div>
					<ul className="list-disc list-inside mt-2">
						{contributorInsights.map((c,i) => <li key={i} className="text-sm">{c}</li>)}
					</ul>
				</div>
			)}
		</section>
	);
}
