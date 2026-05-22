import React from 'react'

export function SkeletonBlock({ className = '' }){
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`} />
}

export function MetricCardSkeleton(){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-4 h-10 w-20" />
      <SkeletonBlock className="mt-3 h-3 w-32" />
    </div>
  )
}

export function ChartSkeleton({ height = 'h-80' }){
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className={`mt-6 w-full ${height}`} />
    </div>
  )
}

export function InsightSkeleton(){
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <SkeletonBlock className="h-5 w-32" />
      <SkeletonBlock className="mt-5 h-4 w-full" />
      <SkeletonBlock className="mt-3 h-4 w-11/12" />
      <SkeletonBlock className="mt-6 h-4 w-44" />
      <div className="mt-3 space-y-3">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-10/12" />
        <SkeletonBlock className="h-4 w-9/12" />
      </div>
    </div>
  )
}
