import React from 'react';
import {
  Home,
  ShieldAlert,
  Bus,
  Wrench,
  Search,
  User,
  LayoutDashboard,
  FileText,
} from 'lucide-react';
import type { StudentNavTab, AdminNavTab } from './Navbar';

interface BottomNavProps {
  role: 'student' | 'admin' | null;
  studentTab?: StudentNavTab;
  onSelectStudentTab?: (tab: StudentNavTab) => void;
  adminTab?: AdminNavTab;
  onSelectAdminTab?: (tab: AdminNavTab) => void;
}

const STUDENT_TABS: { tab: StudentNavTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { tab: 'home',      label: 'Home',     Icon: Home        },
  { tab: 'report',    label: 'Report',   Icon: Wrench      },
  { tab: 'track',     label: 'Track',    Icon: Search      },
  { tab: 'safety',    label: 'Safety',   Icon: ShieldAlert },
  { tab: 'transport', label: 'Transit',  Icon: Bus         },
  { tab: 'profile',   label: 'Profile',  Icon: User        },
];

const ADMIN_TABS: { tab: AdminNavTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { tab: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { tab: 'reports',   label: 'Reports',   Icon: FileText        },
  { tab: 'sos',       label: 'SOS',       Icon: ShieldAlert     },
  { tab: 'transport', label: 'Transit',   Icon: Bus             },
  { tab: 'profile',   label: 'Profile',   Icon: User            },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  studentTab = 'home',
  onSelectStudentTab,
  adminTab = 'dashboard',
  onSelectAdminTab,
}) => {
  if (!role) return null;

  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      <div className="bottom-nav-container">
        {role === 'student' &&
          STUDENT_TABS.map(({ tab, label, Icon }) => {
            const isActive = studentTab === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectStudentTab && onSelectStudentTab(tab)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="bottom-nav-icon-wrap">
                  <Icon size={18} />
                </span>
                <span className="bottom-nav-label">{label}</span>
              </button>
            );
          })}

        {role === 'admin' &&
          ADMIN_TABS.map(({ tab, label, Icon }) => {
            const isActive = adminTab === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectAdminTab && onSelectAdminTab(tab)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="bottom-nav-icon-wrap">
                  <Icon size={18} />
                </span>
                <span className="bottom-nav-label">{label}</span>
              </button>
            );
          })}
      </div>
    </nav>
  );
};
