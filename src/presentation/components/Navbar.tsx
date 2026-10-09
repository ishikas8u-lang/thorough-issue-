import React from 'react';
import {
  ShieldAlert,
  Phone,
  Home,
  User,
  LayoutDashboard,
  FileText,
  Building2,
  Database,
  Bus,
  Wrench,
  Search,
} from 'lucide-react';
import { PRIMARY_EMERGENCY } from '../../infrastructure/seedData';
import type { StudentSession } from '../../types';

export type StudentNavTab = 'home' | 'report' | 'track' | 'safety' | 'transport' | 'profile';
export type AdminNavTab = 'dashboard' | 'reports' | 'sos' | 'transport' | 'profile';
export type ActiveTab = StudentNavTab;

interface NavbarProps {
  role: 'student' | 'admin' | null;
  studentTab?: StudentNavTab;
  onSelectStudentTab?: (tab: StudentNavTab) => void;
  adminTab?: AdminNavTab;
  onSelectAdminTab?: (tab: AdminNavTab) => void;
  studentSession: StudentSession | null;
  onSignOut: () => void;
  onGoHome: () => void;
  dbStatus?: { ok: boolean; latency: number } | null;
}

const STUDENT_NAV_ITEMS: { tab: StudentNavTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { tab: 'home',      label: 'Home',                  Icon: Home        },
  { tab: 'report',    label: 'Report Issue',          Icon: Wrench      },
  { tab: 'track',     label: 'My Reports & Track',    Icon: Search      },
  { tab: 'safety',    label: 'Safety & SOS',          Icon: ShieldAlert },
  { tab: 'transport', label: 'Transport',             Icon: Bus         },
  { tab: 'profile',   label: 'Profile',               Icon: User        },
];

const ADMIN_NAV_ITEMS: { tab: AdminNavTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { tab: 'dashboard', label: 'Dashboard',             Icon: LayoutDashboard },
  { tab: 'reports',   label: 'Reports Queue',         Icon: FileText        },
  { tab: 'sos',       label: 'SOS Inbox',             Icon: ShieldAlert     },
  { tab: 'transport', label: 'Transport Management',  Icon: Bus             },
  { tab: 'profile',   label: 'Profile',               Icon: User            },
];

export const Navbar: React.FC<NavbarProps> = ({
  role,
  studentTab = 'home',
  onSelectStudentTab,
  adminTab = 'dashboard',
  onSelectAdminTab,
  studentSession,
  onSignOut,
  onGoHome,
  dbStatus,
}) => {
  return (
    <header className="header">
      {/* Top institutional bar */}
      <div className="header-top-bar" role="banner" aria-label="SRM University Header Bar">
        <div className="container header-top-container">
          <div className="srm-top-brand" aria-label="SRM University Institution">
            <span className="srm-brand-badge-pill">SRM UNIVERSITY</span>
            <span className="srm-brand-dept">
              {role === 'admin'
                ? 'Campus Operations • Admin Block'
                : role === 'student'
                ? 'Student Safety & Facilities Portal'
                : 'Campus Assist • Operations & Student Services'}
            </span>

            {/* Live Database status pill */}
            <span
              className="db-status-pill"
              title={
                dbStatus?.ok
                  ? `Backend SQLite Database Connected (${dbStatus.latency}ms latency)`
                  : 'Backend Database Active / Local Storage Sync'
              }
            >
              <Database size={11} />
              <span className={`db-status-dot ${dbStatus?.ok ? 'online' : 'syncing'}`} />
              <span>{dbStatus?.ok ? `SQLite Live (${dbStatus.latency}ms)` : 'Database Active'}</span>
            </span>
          </div>

          <div className="header-top-right">
            {role === 'student' && studentSession ? (
              <div className="student-header-session">
                <span className="student-status-dot" title="Authenticated session active" />
                <span className="truncate-line" style={{ maxWidth: '140px' }} title={studentSession.student.fullName}>
                  {studentSession.student.fullName}
                </span>
                <button
                  type="button"
                  className="student-top-link"
                  onClick={() => onSelectStudentTab && onSelectStudentTab('profile')}
                  title="View Student Profile"
                >
                  <User size={12} />
                  <span>Profile</span>
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
            ) : role === 'admin' && studentSession ? (
              <div className="student-header-session">
                <span className="student-status-dot" style={{ background: '#38bdf8' }} title="Admin session active" />
                <span className="truncate-line" style={{ maxWidth: '140px' }} title={studentSession.student.fullName}>
                  {studentSession.student.fullName || 'Admin Reviewer'}
                </span>
                <button
                  type="button"
                  className="student-top-signout"
                  onClick={onSignOut}
                  title="Sign out of Admin Block"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  SRM University Sonipat
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container nav-container">
        {/* Brand Home / Logo */}
        <button
          type="button"
          className="brand-wrap"
          onClick={onGoHome}
          title="Campus Assist"
          aria-label="Campus Assist"
        >
          <div className="brand-icon">
            <ShieldAlert size={22} />
          </div>
          <div className="brand-text-block">
            <div className="brand-title">Campus Assist</div>
            <div className="brand-subtitle">
              {role === 'admin'
                ? 'Admin Block Portal'
                : role === 'student'
                ? 'Student Portal'
                : 'SRM Operations Portal'}
            </div>
          </div>
        </button>

        {/* STUDENT PORTAL NAV LINKS */}
        {role === 'student' && onSelectStudentTab && (
          <nav className="nav-links desktop-only" aria-label="Student Portal Navigation">
            {STUDENT_NAV_ITEMS.map(({ tab, label, Icon }) => (
              <button
                key={tab}
                type="button"
                className={`nav-btn ${studentTab === tab ? 'active' : ''}`}
                onClick={() => onSelectStudentTab(tab)}
                title={label}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* ADMIN PORTAL NAV LINKS */}
        {role === 'admin' && onSelectAdminTab && (
          <nav className="nav-links desktop-only" aria-label="Admin Block Navigation">
            {ADMIN_NAV_ITEMS.map(({ tab, label, Icon }) => (
              <button
                key={tab}
                type="button"
                className={`nav-btn ${adminTab === tab ? 'active' : ''}`}
                onClick={() => onSelectAdminTab(tab)}
                title={label}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Action Controls Cluster */}
        <div className="nav-right-cluster">
          {/* Emergency Call Button (Visible on Student Portal and Public views) */}
          {role !== 'admin' && (
            <a
              href={`tel:${PRIMARY_EMERGENCY.phone}`}
              className="btn btn-emergency-cta"
              title={`Call Security immediately: ${PRIMARY_EMERGENCY.phone}`}
              aria-label={`Call Campus Security: ${PRIMARY_EMERGENCY.phone}`}
            >
              <Phone size={14} className="emergency-phone-icon" />
              <span>Call Security</span>
            </a>
          )}

          {/* Admin Block Header Indicator if role === 'admin' */}
          {role === 'admin' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: 'var(--color-brand-primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Building2 size={15} />
              <span>Admin Block Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
