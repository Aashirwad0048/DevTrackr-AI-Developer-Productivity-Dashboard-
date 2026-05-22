import React from 'react'

export default function ConnectGitHub(){
  const connect = () => {
    // Open backend OAuth redirect. Assumes user is authenticated and has JWT stored.
    window.location.href = `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/auth/github`;
  }
  return (
    <button onClick={connect} style={{padding: '8px 12px', background: '#0366d6', color: '#fff', border: 'none', borderRadius: 6}}>Connect GitHub</button>
  )
}
