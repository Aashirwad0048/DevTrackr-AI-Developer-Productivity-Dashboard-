import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function PRChart({ prMetrics = {} }){
  const { openPRs = 0, mergedPRs = 0, closedPRs = 0 } = prMetrics;
  const data = [
    { name: 'Open', value: openPRs },
    { name: 'Merged', value: mergedPRs },
    { name: 'Closed', value: closedPRs }
  ];

  if (data.reduce((s,d)=>s+d.value,0) === 0) return <div>No PR data to display.</div>

  return (
    <section style={{width:'100%', maxWidth:500}}>
      <h3>Pull Request Breakdown</h3>
      <div style={{width: '100%', height: 250}}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
