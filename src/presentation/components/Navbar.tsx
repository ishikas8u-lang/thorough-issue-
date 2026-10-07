import React from 'react';
import { ShieldAlert, Phone, Bus, Wrench, Search, Lock, Home, User, LogIn } from 'lucide-react';
import { PRIMARY_EMERGENCY } from '../../infrastructure/seedData';
import type { StudentSession } from '../../types';

export type ActiveTab = 'home' | 'safety' | 'transport' | 'report' | 'lookup' | 'staff' | 'signin' | 'profile';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  staffUser: string | null;
  onOpenStaffModal: () => void;
  studentSession: StudentSession | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  staffUser,
  onOpenStaffModal,
  studentSession,
  onSignOut,
}) => {
  return (
    <header className="header">
      {/* Top Corner Institutional Header with SRM University Branding */}
      <div className="header-top-bar" role="banner" aria-label="SRM University Header Bar">
        <div className="container header-top-container">
          <div className="srm-top-brand" aria-label="SRM University Institution">
            <span className="srm-brand-badge-pill">SRM UNIVERSITY</span>
            <span className="srm-brand-dept">Campus Assist &bull; Operations &amp; Student Services</span>
          </div>

          <div className="header-top-right">
            {studentSession ? (
              <div className="student-header-session">
                <span className="student-status-dot" title="Authenticated session active" />
                <span>
                  Student: <strong>{studentSession.student.fullName}</strong>
                </span>
                <button
                  type="button"
                  className="student-top-link"
                  onClick={() => setActiveTab('profile')}
                  title="View Student Profile"
                >
                  My Profile
                </button>
                <button
                  type="button"
                  className="student-top-signout"
                  onClick={onSignOut}
                  title="Sign out of student account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="student-top-signin-btn"
                onClick={() => setActiveTab('signin')}
              >
                <LogIn size={13} /> Student Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container nav-container">
        <div className="brand-wrap" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <div className="brand-icon">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="brand-title">Campus Assist</div>
            <div className="brand-subtitle">SRM University Operations Portal</div>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary Site Navigation">
          <button
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={17} /> Home
          </button>
          <button
            className={`nav-btn ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <ShieldAlert size={17} /> Safety
          </button>
          <button
            className={`nav-btn ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <Bus size={17} /> Transport
          </button>
          <button
            className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <Wrench size={17} /> Report Issue
          </button>
          <button
            className={`nav-btn ${activeTab === 'lookup' ? 'active' : ''}`}
            onClick={() => setActiveTab('lookup')}
          >
            <Search size={17} /> Track Status
          </button>
          <button
            className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            aria-label={staffUser ? `Admin Block (${staffUser})` : 'Admin Block'}
            title="Admin Block operations and review queue"
            onClick={() => {
              if (staffUser) {
                setActiveTab('staff');
              } else {
                onOpenStaffModal();
              }
            }}
          >
            <Lock size={17} /> {staffUser ? `Admin Block (${staffUser})` : 'Admin Block'}
          </button>

          {/* Student Account Action Button */}
          {studentSession ? (
            <button
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              style={{
                background: activeTab === 'profile' ? 'var(--color-pink-200)' : 'var(--color-pink-100)',
                color: 'var(--color-pink-dark-text)',
                border: '1px solid var(--color-pink-300)',
                fontWeight: 700,
              }}
              onClick={() => setActiveTab('profile')}
              title={`Student Profile: ${studentSession.student.fullName}`}
            >
              <User size={17} color="var(--color-pink-600)" /> {studentSession.student.fullName.split(' ')[0]}
            </button>
          ) : (
            <button
              className={`nav-btn ${activeTab === 'signin' ? 'active' : ''}`}
              style={{
                background: activeTab === 'signin' ? 'var(--color-pink-200)' : 'var(--color-pink-100)',
                color: 'var(--color-pink-dark-text)',
                border: '1px solid var(--color-pink-300)',
                fontWeight: 700,
              }}
              onClick={() => setActiveTab('signin')}
              title="Student Sign In"
            >
              <LogIn size={17} color="var(--color-pink-600)" /> Sign In
            </button>
          )}
        </nav>

        <a
          href={`tel:${PRIMARY_EMERGENCY.phone}`}
          className="emergency-pill-btn"
          title={`Call 24/7 Security: ${PRIMARY_EMERGENCY.phone}`}
        >
          <Phone size={15} />
          <span>Call Security (24/7)</span>
        </a>
      </div>
    </header>
  );
};

