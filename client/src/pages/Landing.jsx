import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const revealRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1 }
    )
    revealRef.current.forEach(el => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const addReveal = (el) => {
    if (el && !revealRef.current.includes(el)) {
      revealRef.current.push(el)
    }
  }

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-glow" />
        <img src="/logo.png" alt="Logo" className="seal" />
        <div className="hero-badge">The Royal Electoral Chamber</div>
        <h1>Where Every Vote<br />Shapes the Future</h1>
        <p>
          Enter the digital election hall. Cast your vote with confidence,
          track results in real-time, and be part of democracy reimagined.
        </p>
        <div className="hero-buttons">
          {isAuthenticated ? (
            <Link to="/home" className="btn btn-primary btn-xl">
              Enter the Chamber &rarr;
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-xl">
                Join the Chamber
              </Link>
              <Link to="/login" className="btn btn-outline btn-xl">
                Sign In
              </Link>
            </>
          )}
        </div>
        <div className="scroll-indicator">
          <span>Explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      <section className="section" ref={addReveal} style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h2 className="section-title">The Chamber Experience</h2>
        <p className="section-subtitle">Built for transparency, security, and scale</p>
        <div className="grid grid-3">
          <div className="feature-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.6s 0.1s' }}>
            <div className="feature-icon">&#128274;</div>
            <h3>Fortified Security</h3>
            <p>Military-grade encryption protects every vote. Your identity stays private, your choice stays yours.</p>
          </div>
          <div className="feature-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.6s 0.2s' }}>
            <div className="feature-icon">&#128202;</div>
            <h3>Real-Time Results</h3>
            <p>Live turnout tracking and instant tallies. Watch democracy unfold as it happens.</p>
          </div>
          <div className="feature-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.6s 0.3s' }}>
            <div className="feature-icon">&#127919;</div>
            <h3>Any Election, Anywhere</h3>
            <p>Government, educational, or local — configure any election in minutes without code.</p>
          </div>
        </div>
      </section>

      <section className="section" ref={addReveal} style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s 0.2s' }}>
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Three steps to make your voice heard</p>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Register & Verify</h4>
            <p>Create your account and verify your identity with a secure OTP sent to your email.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Browse & Choose</h4>
            <p>Explore elections, review candidates, and make an informed decision.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Cast & Confirm</h4>
            <p>Submit your vote with a single click. Get a receipt to verify it was counted.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Track & Verify</h4>
            <p>Monitor turnout in real-time and verify results after the election closes.</p>
          </div>
        </div>
      </section>

      <section className="section" ref={addReveal} style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s 0.3s' }}>
        <h2 className="section-title">E-Voting vs Traditional Voting</h2>
        <p className="section-subtitle">Modern democracy needs modern tools</p>

        <div className="comparison-header">
          <span className="comparison-label comparison-label--evoting">E-Voting</span>
          <span className="comparison-divider" />
          <span className="comparison-label comparison-label--traditional">Traditional</span>
        </div>

        <div className="comparison-list">
          <div className="comparison-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s 0.05s' }}>
            <div className="comparison-side comparison-side--win">
              <span className="comparison-icon"><BarChartIcon /></span>
              <span className="comparison-value">Real-Time Tabulation</span>
            </div>
            <div className="comparison-topic">Results</div>
            <div className="comparison-side">
              <span className="comparison-icon"><ClockIcon /></span>
              <span className="comparison-value">Manual Tabulation</span>
            </div>
          </div>

          <div className="comparison-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s 0.1s' }}>
            <div className="comparison-side comparison-side--win">
              <span className="comparison-icon"><GlobeIcon /></span>
              <span className="comparison-value">Remote Participation</span>
            </div>
            <div className="comparison-topic">Access</div>
            <div className="comparison-side">
              <span className="comparison-icon"><MapPinIcon /></span>
              <span className="comparison-value">In-Person Voting</span>
            </div>
          </div>

          <div className="comparison-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s 0.15s' }}>
            <div className="comparison-side comparison-side--win">
              <span className="comparison-icon"><LeafIcon /></span>
              <span className="comparison-value">Digital Ballots</span>
            </div>
            <div className="comparison-topic">Materials</div>
            <div className="comparison-side">
              <span className="comparison-icon"><PaperIcon /></span>
              <span className="comparison-value">Paper Ballots</span>
            </div>
          </div>

          <div className="comparison-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s 0.2s' }}>
            <div className="comparison-side comparison-side--win">
              <span className="comparison-icon"><ShieldIcon /></span>
              <span className="comparison-value">Cryptographic Security</span>
            </div>
            <div className="comparison-topic">Security</div>
            <div className="comparison-side">
              <span className="comparison-icon"><SearchIcon /></span>
              <span className="comparison-value">Manual Auditing</span>
            </div>
          </div>

          <div className="comparison-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s 0.25s' }}>
            <div className="comparison-side comparison-side--win">
              <span className="comparison-icon"><UsersIcon /></span>
              <span className="comparison-value">Universal Accessibility</span>
            </div>
            <div className="comparison-topic">Participation</div>
            <div className="comparison-side">
              <span className="comparison-icon"><ArrowIcon /></span>
              <span className="comparison-value">Geographic Constraints</span>
            </div>
          </div>

          <div className="comparison-card" ref={addReveal} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s 0.3s' }}>
            <div className="comparison-side comparison-side--win">
              <span className="comparison-icon"><TrendIcon /></span>
              <span className="comparison-value">Reduced Operational Cost</span>
            </div>
            <div className="comparison-topic">Cost</div>
            <div className="comparison-side">
              <span className="comparison-icon"><DollarIcon /></span>
              <span className="comparison-value">Higher Administrative Cost</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function BarChartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> }
function GlobeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function MapPinIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function LeafIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg> }
function PaperIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg> }
function ShieldIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function UsersIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function ArrowIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> }
function TrendIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> }
function DollarIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
