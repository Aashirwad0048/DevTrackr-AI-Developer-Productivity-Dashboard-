import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar(){
	const navigate = useNavigate();
	const token = localStorage.getItem('token');

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/login');
	};

	return (
		<nav className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
				<div className="flex items-center gap-3 md:hidden">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/50">
						DT
					</div>
					<div>
						<div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">DevTrackr</div>
						<div className="text-sm text-slate-500">Repository intelligence console</div>
					</div>
				</div>
				<div className="hidden md:block"></div>
				<div className="flex items-center gap-2 md:hidden">
					{token ? (
						<button onClick={handleLogout} className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-400">
							Logout
						</button>
					) : (
						<Link to="/login" className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
							Log in
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}
