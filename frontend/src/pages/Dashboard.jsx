import React from 'react'
import Navbar from '../components/Navbar'
import CommitChart from '../components/CommitChart'
import ConnectGitHub from '../components/ConnectGitHub'
import RepoList from '../components/RepoList'

export default function Dashboard(){
  return (
    <div>
      <Navbar/>
      <main className="p-4">
        <h1>Dashboard</h1>
        <div style={{margin: '12px 0'}}>
          <ConnectGitHub />
        </div>
        <RepoList />
        <CommitChart />
      </main>
    </div>
  )
}
