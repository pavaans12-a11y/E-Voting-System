import { useEffect, useState } from 'react'

export default function LoadingScreen({ onFinish, minDuration = 1200 }) {
  const [exiting, setExiting] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const exitAt = minDuration - 300
    const timer = setTimeout(() => setExiting(true), Math.max(exitAt, 400))
    const prog = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 100))
    }, 120)
    const exit = setTimeout(() => onFinish(), minDuration)
    return () => { clearTimeout(timer); clearTimeout(exit); clearInterval(prog) }
  }, [])

  return (
    <div className={`loading-screen${exiting ? ' loading-exit' : ''}`}>
      <div className="loader-content">
        <div className="loader-logo-ring">
          <div className="loader-ring loader-ring--outer" />
          <div className="loader-ring loader-ring--inner" />
          <img src="/logo.png" alt="" className="loader-logo" />
        </div>
        <h1 className="loader-title">E-Voting System</h1>
        <p className="loader-subtitle">Preparing the chamber</p>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
