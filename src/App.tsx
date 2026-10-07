import React, { useState } from 'react';
import { Navbar } from './presentation/components/Navbar';
import type { ActiveTab } from './presentation/components/Navbar';
import { HomeView } from './presentation/views/HomeView';
import { SafetyView } from './presentation/views/SafetyView';
import { TransportView } from './presentation/views/TransportView';
import { ReportView } from './presentation/views/ReportView';
import { LookupView } from './presentation/views/LookupView';
import { StaffView } from './presentation/views/StaffView';
import { LocalStorageReportRepository } from './infrastructure/repositories';
import { ShieldAlert } from 'lucide-react';

const reportRepository = new LocalStorageReportRepository();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedLookupRef, setSelectedLookupRef] = useState<string | undefined>(undefined);
  const [staffUser, setStaffUser] = useState<string | null>('staff_vansh'); // Pre-logged-in demo reviewer

  const handleQuickLookup = (refCode: string) => {
    setSelectedLookupRef(refCode);
    setActiveTab('lookup');
  };

  const handleTrackSubmitted = (refCode: string) => {
    setSelectedLookupRef(refCode);
    setActiveTab('lookup');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Persistent Demo Disclaimer Watermark Banner */}
      <div className="demo-banner">
        <strong>DEMO EVALUATION BUILD</strong>
        <span>
          Sample verified data for class demonstration. This site is not monitored by university emergency dispatchers.
        </span>
      </div>

      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'lookup') {
            setSelectedLookupRef(undefined);
          }
          setActiveTab(tab);
        }}
        staffUser={staffUser}
        onOpenStaffModal={() => setActiveTab('staff')}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            onQuickLookup={handleQuickLookup}
          />
        )}

        {activeTab === 'safety' && <SafetyView />}

        {activeTab === 'transport' && <TransportView />}

        {activeTab === 'report' && (
          <ReportView
            reportRepository={reportRepository}
            onTrackSubmitted={handleTrackSubmitted}
          />
        )}

        {activeTab === 'lookup' && (
          <LookupView
            reportRepository={reportRepository}
            initialRefCode={selectedLookupRef}
          />
        )}

        {activeTab === 'staff' && (
          <StaffView
            reportRepository={reportRepository}
            staffUser={staffUser}
            onLogin={(user) => setStaffUser(user)}
            onLogout={() => setStaffUser(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <ShieldAlert size={18} /> Campus Assist System
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Designed & Engineered by <strong>Ishika</strong>, <strong>Tishya</strong>, <strong>Krisha</strong>, and <strong>Vansh</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem' }}>
            <span>Architecture: <strong>SOLID Compliant</strong></span>
            <span>Timezone: <strong>Asia/Kolkata (IST)</strong></span>
            <span>Status: <strong>Phase 1 Operational Shell</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
