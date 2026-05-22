import React from 'react'
import Navbar from '../components/Navbar'
import CommitChart from '../components/CommitChart'
import ConnectGitHub from '../components/ConnectGitHub'

export default function Dashboard(){
  return (
    <div>
      <Navbar/>
      <main className="p-4">
        <h1>Dashboard</h1>
        <div style={{margin: '12px 0'}}>
          <ConnectGitHub />
        </div>
        <CommitChart />
      </main>
    </div>
  )
}
