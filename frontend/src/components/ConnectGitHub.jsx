import React from 'react'
import axios from '../api/axios'

export default function ConnectGitHub(){
  const connect = () => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    if (!token) {
      // redirect to login/signup page if not authenticated
      window.location.href = '/login';
      return;
    }
    // Request the OAuth URL from backend (includes Authorization header)
    fetch(`${base}/auth/github/url`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || r.statusText);
        const data = await r.json();
        if (data.url) window.location.href = data.url;
      })
      .catch(err => {
        // fallback: navigate to auth endpoint directly
        window.location.href = `${base}/auth/github`;
      });
  }
  return (
    <div className="flex items-center gap-3">
      <button onClick={connect} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-lg shadow hover:opacity-95">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.75 5.48.75 11.76c0 4.94 3.29 9.12 7.86 10.6.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.75-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.04 11.04 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.43-2.7 5.4-5.28 5.68.42.36.8 1.08.8 2.17 0 1.57-.01 2.83-.01 3.21 0 .31.21.68.8.56 4.56-1.48 7.83-5.66 7.83-10.6C23.25 5.48 18.27.5 12 .5z"/></svg>
        <span className="text-sm font-medium">Connect GitHub</span>
      </button>

      {import.meta.env.DEV && (
        <button
          onClick={async () => {
            try {
              const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
              const res = await axios.get(`${base}/dev/token`);
              const tok = res.data?.token;
              if (tok) {
                localStorage.setItem('token', tok);
                window.location.reload();
              }
            } catch (e) {
              console.error('Demo login failed', e);
              alert('Demo login failed: ' + (e.response?.data?.error || e.message));
            }
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
        >
          Use Demo Login
        </button>
      )}
    </div>
  )
}
