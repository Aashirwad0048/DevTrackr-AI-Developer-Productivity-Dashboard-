import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RepoList from '../components/RepoList'

export default function Repository() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Your Repositories</h1>
          <Link to="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
            Back to Dashboard
          </Link>
        </div>

        <RepoList />
        </main>
      </div>
    </div>
  )
}
