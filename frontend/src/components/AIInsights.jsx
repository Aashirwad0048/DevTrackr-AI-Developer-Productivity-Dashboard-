import React, { useEffect, useState } from 'react'
import axios from '../api/axios'

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
	if (loadingAI) return <div style={{marginTop:12}}>Loading AI insights...</div>;
	if (error) return <div style={{color:'red', marginTop:12}}>AI Error: {error}</div>;
	if (!insights) return null;

	const { summary, bottlenecks = [], recommendations = [], contributorInsights = [] } = insights;

	return (
		<section style={{marginTop:16, padding:12, border:'1px solid #e5e7eb', borderRadius:8, background:'#fff'}}>
			<h2 style={{margin:0, marginBottom:8}}>AI Insights</h2>
			{summary && (
				<div style={{marginBottom:12}}>
					<strong>Sprint Summary</strong>
					<p style={{margin:6}}>{summary}</p>
				</div>
			)}

			{bottlenecks.length > 0 && (
				<div style={{marginBottom:12}}>
					<strong>Bottlenecks</strong>
					<ul>
						{bottlenecks.map((b,i) => <li key={i}>{b}</li>)}
					</ul>
				</div>
			)}

			{recommendations.length > 0 && (
				<div style={{marginBottom:12}}>
					<strong>Recommendations</strong>
					<ul>
						{recommendations.map((r,i) => <li key={i}>{r}</li>)}
					</ul>
				</div>
			)}

			{contributorInsights.length > 0 && (
				<div>
					<strong>Contributor Insights</strong>
					<ul>
						{contributorInsights.map((c,i) => <li key={i}>{c}</li>)}
					</ul>
				</div>
			)}
		</section>
	);
}
