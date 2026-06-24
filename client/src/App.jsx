import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, VoterRoute, AdminRoute } from './utils/ProtectedRoute'
import Navbar from './components/Navbar'
import ParticleBackground from './components/ParticleBackground'
import LoadingScreen from './components/LoadingScreen'

import Landing from './pages/Landing'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import PublicCandidateProfile from './pages/PublicCandidateProfile'
import Dashboard from './pages/Dashboard'
import ElectionsList from './pages/ElectionsList'
import ElectionDetail from './pages/ElectionDetail'
import VotePage from './pages/VotePage'
import ResultsPage from './pages/ResultsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import NominatePage from './pages/NominatePage'
import MyNominations from './pages/MyNominations'
import ReceiptPage from './pages/ReceiptPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import AdminStudents from './pages/AdminStudents'
import AdminElections from './pages/AdminElections'
import AdminElectionNew from './pages/AdminElectionNew'
import AdminCandidates from './pages/AdminCandidates'
import AdminResultsPage from './pages/AdminResultsPage'
import AdminExportPage from './pages/AdminExportPage'
import AuditLogs from './pages/AuditLogs'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/elections">Elections</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Team Members</h4>
            <div className="footer-links">
              <span>VARUN MURTHY</span>
              <span>PAVAN S</span>
              <span>PRIYANKA BAI</span>
              <span>SHREYA GONI</span>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Guide</h4>
            <div className="footer-links">
              <span>Sahana</span>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Department</h4>
            <div className="footer-links">
              <span>Department of MCA</span>
              <span>MSRIT, Bengaluru</span>
            </div>
          </div>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} E-Voting System. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [loadKey, setLoadKey] = useState(0)
  const [prevPath, setPrevPath] = useState('')
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setPrevPath(location.pathname)
      if (loadKey > 0) setLoading(true)
      setLoadKey(k => k + 1)
    }
  }, [location.pathname])

  return (
    <AuthProvider>
      {loading && <LoadingScreen key={loadKey} onFinish={() => setLoading(false)} minDuration={loadKey === 0 ? 5000 : 1500} />}
      <ParticleBackground />
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/candidates/:id" element={<PublicCandidateProfile />} />
            <Route path="/home" element={<VoterRoute><Dashboard /></VoterRoute>} />
            <Route path="/elections" element={<ProtectedRoute><ElectionsList /></ProtectedRoute>} />
            <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetail /></ProtectedRoute>} />
            <Route path="/vote/:id" element={<VoterRoute><VotePage /></VoterRoute>} />
            <Route path="/elections/:id/nominate" element={<VoterRoute><NominatePage /></VoterRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/receipt/:token" element={<VoterRoute><ReceiptPage /></VoterRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/my-nominations" element={<ProtectedRoute><MyNominations /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
            <Route path="/admin/elections" element={<AdminRoute><AdminElections /></AdminRoute>} />
            <Route path="/admin/elections/new" element={<AdminRoute><AdminElectionNew /></AdminRoute>} />
            <Route path="/admin/candidates" element={<AdminRoute><AdminCandidates /></AdminRoute>} />
            <Route path="/admin/results/:id" element={<AdminRoute><AdminResultsPage /></AdminRoute>} />
            <Route path="/admin/export/:id" element={<AdminRoute><AdminExportPage /></AdminRoute>} />
            <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
