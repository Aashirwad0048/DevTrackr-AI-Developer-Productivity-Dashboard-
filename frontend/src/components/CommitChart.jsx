import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CommitChart({ data = [] }){
	// data expected: [{date: 'YYYY-MM-DD', count: number}, ...]
	if (!data || data.length === 0) return <div>No commit data to display.</div>

	return (
		<section style={{marginTop:20}}>
			<h3>Commit Activity</h3>
			<div style={{width:'100%', height:300}}>
				<ResponsiveContainer>
					<LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="date" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={false} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	)
}
