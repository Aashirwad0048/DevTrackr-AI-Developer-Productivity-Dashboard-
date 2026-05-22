import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function IssueChart({ issueMetrics = {} }){
  const { openIssues = 0, closedIssues = 0 } = issueMetrics;
  const data = [ { name: 'Issues', open: openIssues, closed: closedIssues } ];
  if (openIssues + closedIssues === 0) return <div>No issue data to display.</div>

  return (
    <section style={{width:'100%', maxWidth:600, marginTop:10}}>
      <h3>Issue Resolution</h3>
      <div style={{width: '100%', height: 250}}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="open" fill="#FF8042" />
            <Bar dataKey="closed" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
