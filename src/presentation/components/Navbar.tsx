import React from 'react';
import { ShieldAlert, Phone, Bus, Wrench, Search, Lock, Home } from 'lucide-react';
import { PRIMARY_EMERGENCY } from '../../infrastructure/seedData';

export type ActiveTab = 'home' | 'safety' | 'transport' | 'report' | 'lookup' | 'staff';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  staffUser: string | null;
  onOpenStaffModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  staffUser,
  onOpenStaffModal,
}) => {
  return (
    <header className="header">
      <div className="container nav-container">
        <div className="brand-wrap" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <div className="brand-icon">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="brand-title">Campus Assist</div>
            <div className="brand-subtitle">Official Student Operations & Safety Portal</div>
          </div>
        </div>

        <nav className="nav-links">
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
