import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <img src="/logo.png" alt="Logo" className="brand-logo" /> E-Voting System
      </Link>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {!isAuthenticated ? (
          <>
            <NavLink to="/" onClick={closeMenu} end>Home</NavLink>
            <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
            <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
          </>
        ) : user?.role === 'admin' ? (
          <>
            <NavLink to="/home" onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/elections" onClick={closeMenu}>Elections</NavLink>
            <div className="dropdown">
              <button>Admin ▾</button>
              <div className="dropdown-menu">
                <NavLink to="/admin/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                <NavLink to="/admin/students" onClick={closeMenu}>Voters</NavLink>
                <NavLink to="/admin/elections" onClick={closeMenu}>Elections</NavLink>
                <NavLink to="/admin/candidates" onClick={closeMenu}>Candidates</NavLink>
                <NavLink to="/admin/audit-logs" onClick={closeMenu}>Audit Logs</NavLink>
              </div>
            </div>
            {user?.photo && (
              <span className="navbar-user">
                <img src={user.photo} alt="" className="navbar-user-avatar" />
              </span>
            )}
            <button onClick={() => { handleLogout(); closeMenu(); }} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/home" onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/elections" onClick={closeMenu}>Elections</NavLink>
            <NavLink to="/leaderboard" onClick={closeMenu}>Leaderboard</NavLink>
            <NavLink to="/my-nominations" onClick={closeMenu}>My Nominations</NavLink>
            <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
            <button onClick={() => { handleLogout(); closeMenu(); }} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
