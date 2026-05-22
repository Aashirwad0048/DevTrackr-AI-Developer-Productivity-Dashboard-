import React from 'react'

export default function IssueTracker() {
  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Issue Management</div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Active Issues</h2>
        </div>
      </div>
      
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        No active issues tracked yet. Select a repository to begin parsing open issues.
      </div>
    </section>
  )
}
