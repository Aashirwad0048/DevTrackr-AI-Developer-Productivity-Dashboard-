import React from 'react'
import Navbar from '../components/Navbar'
import CommitChart from '../components/CommitChart'

export default function Dashboard(){
  return (
    <div>
      <Navbar/>
      <main className="p-4">
        <h1>Dashboard</h1>
        <CommitChart />
      </main>
    </div>
  )
}
