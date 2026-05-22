import React from 'react'

export default function Navbar(){
	return (
		<nav className="w-full bg-white border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
			<div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">DT</div>
					<div className="text-lg font-semibold">DevTrackr</div>
				</div>
				<div className="flex items-center gap-3">
					<button className="text-sm text-slate-600 dark:text-slate-300">Docs</button>
					<button className="text-sm text-slate-600 dark:text-slate-300">Account</button>
				</div>
			</div>
		</nav>
	)
}
