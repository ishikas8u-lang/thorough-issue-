import React from 'react';
import { motion } from 'motion/react';
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

const NAV_ITEMS: { tab: ActiveTab; label: string; shortLabel: string; Icon: React.FC<{ size?: number }> }[] = [
  { tab: 'home',      label: 'Home',         shortLabel: 'Home',    Icon: Home        },
  { tab: 'safety',    label: 'Safety',       shortLabel: 'Safety',  Icon: ShieldAlert },
  { tab: 'transport', label: 'Transport',    shortLabel: 'Transit', Icon: Bus         },
  { tab: 'report',    label: 'Report Issue', shortLabel: 'Report',  Icon: Wrench      },
  { tab: 'lookup',    label: 'Track Status', shortLabel: 'Track',   Icon: Search      },
];

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
      {/* Top institutional bar */}
      <div className="header-top-bar" role="banner" aria-label="SRM University Header Bar">
        <div className="container header-top-container">
          <div className="srm-top-brand" aria-label="SRM University Institution">
            <span className="srm-brand-badge-pill">SRM UNIVERSITY</span>
            <span className="srm-brand-dept" title="Campus Assist • Operations & Student Services">
              Campus Assist &bull; Operations &amp; Student Services
            </span>
          </div>

          <div className="header-top-right">
            {studentSession ? (
              <div className="student-header-session">
                <span className="student-status-dot" title="Authenticated session active" />
                <span className="truncate-line" style={{ maxWidth: '180px' }} title={studentSession.student.fullName}>
                  Student: <strong>{studentSession.student.fullName}</strong>
                </span>
                <button
                  type="button"
                  className="student-top-link"
                  onClick={() => setActiveTab('profile')}
                  title="View Student Profile"
                >
                  Profile
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
                title="Student Portal Sign In"
              >
                <LogIn size={13} />
                <span>Student Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container nav-container">
        {/* Brand */}
        <motion.div
          className="brand-wrap"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('home')}
          whileTap={{ scale: 0.97 }}
          title="Campus Assist Home"
        >
          <div className="brand-icon">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="brand-title">Campus Assist</div>
            <div className="brand-subtitle">SRM Operations Portal</div>
          </div>
        </motion.div>

        {/* Nav links */}
        <nav className="nav-links" aria-label="Primary Site Navigation">
          {NAV_ITEMS.map(({ tab, label, shortLabel, Icon }) => (
            <motion.button
              key={tab}
              className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              title={label}
            >
              <Icon size={16} />
              <span className="nav-label-desktop">{label}</span>
              <span className="nav-label-mobile">{shortLabel}</span>
            </motion.button>
          ))}

          {/* Staff / Admin Block */}
          <motion.button
            className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            aria-label={staffUser ? `Admin Block (${staffUser})` : 'Admin Block'}
            title={staffUser ? `Admin Block (${staffUser})` : 'Admin Block'}
            onClick={() => {
              if (staffUser) {
                setActiveTab('staff');
              } else {
                onOpenStaffModal();
              }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Lock size={16} />
            <span className="nav-label-desktop">{staffUser ? `Admin (${staffUser})` : 'Admin Block'}</span>
            <span className="nav-label-mobile">Admin</span>
          </motion.button>

          {/* Student Account */}
          {studentSession ? (
            <motion.button
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              style={{
                background: activeTab === 'profile' ? 'var(--color-pink-200)' : 'var(--color-pink-100)',
                color: 'var(--color-pink-dark-text)',
                border: '1px solid var(--color-pink-border)',
                fontWeight: 700,
              }}
              onClick={() => setActiveTab('profile')}
              title={`Student Profile: ${studentSession.student.fullName}`}
              whileTap={{ scale: 0.95 }}
            >
              <User size={16} color="var(--color-pink-600)" />
              <span className="truncate-line" style={{ maxWidth: '85px' }}>
                {studentSession.student.fullName.split(' ')[0]}
              </span>
            </motion.button>
          ) : (
            <motion.button
              className={`nav-btn ${activeTab === 'signin' ? 'active' : ''}`}
              style={{
                background: activeTab === 'signin' ? 'var(--color-pink-200)' : 'var(--color-pink-100)',
                color: 'var(--color-pink-dark-text)',
                border: '1px solid var(--color-pink-border)',
                fontWeight: 700,
              }}
              onClick={() => setActiveTab('signin')}
              title="Student Sign In"
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={16} color="var(--color-pink-600)" />
              <span className="nav-label-desktop">Sign In</span>
              <span className="nav-label-mobile">Login</span>
            </motion.button>
          )}
        </nav>

        {/* Emergency CTA */}
        <motion.a
          href={`tel:${PRIMARY_EMERGENCY.phone}`}
          className="emergency-pill-btn"
          title={`Call 24/7 Security: ${PRIMARY_EMERGENCY.phone}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        >
          <Phone size={15} />
          <span>Call Security (24/7)</span>
        </motion.a>
      </div>
    </header>
  );
};
