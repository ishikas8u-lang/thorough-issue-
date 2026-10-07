import React, { useState, useEffect } from 'react';
import { Navbar } from './presentation/components/Navbar';
import type { ActiveTab } from './presentation/components/Navbar';
import { HomeView } from './presentation/views/HomeView';
import { SafetyView } from './presentation/views/SafetyView';
import { TransportView } from './presentation/views/TransportView';
import { ReportView } from './presentation/views/ReportView';
import { LookupView } from './presentation/views/LookupView';
import { StaffView } from './presentation/views/StaffView';
import { SignInView } from './presentation/views/SignInView';
import { ProfileView } from './presentation/views/ProfileView';
import { LocalStorageReportRepository } from './infrastructure/repositories';
import { LocalStorageStudentAuthService } from './infrastructure/authService';
import type { StudentSession, StudentProfile } from './types';
import { ShieldAlert } from 'lucide-react';

const reportRepository = new LocalStorageReportRepository();
const authService = new LocalStorageStudentAuthService();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedLookupRef, setSelectedLookupRef] = useState<string | undefined>(undefined);
  const [staffUser, setStaffUser] = useState<string | null>('staff_vansh'); // Pre-logged-in demo reviewer
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Initialize student session on mount
  useEffect(() => {
    authService.getCurrentSession().then((session) => {
      setStudentSession(session);
    });
  }, []);

  const handleQuickLookup = (refCode: string) => {
    setSelectedLookupRef(refCode);
    setActiveTab('lookup');
  };

  const handleTrackSubmitted = (refCode: string) => {
    setSelectedLookupRef(refCode);
    setActiveTab('lookup');
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== 'lookup') {
      setSelectedLookupRef(undefined);
    }

    // Protected Route Enforcement: Profile requires active authenticated student session
    if (tab === 'profile' && !studentSession) {
      setAuthNotice('Please sign in to access your student profile.');
      setActiveTab('signin');
      return;
    }

    if (tab !== 'signin') {
      setAuthNotice(null);
    }

    setActiveTab(tab);
  };

  const handleSignInSuccess = (session: StudentSession) => {
    setStudentSession(session);
    setAuthNotice(null);
    setActiveTab('profile');
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setStudentSession(null);
    setAuthNotice('You have been signed out successfully.');
    setActiveTab('signin');
  };

  const handleProfileUpdated = (updatedProfile: StudentProfile) => {
    if (studentSession) {
      setStudentSession({
        ...studentSession,
        student: updatedProfile,
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Persistent Demo Disclaimer Watermark Banner */}
      <div className="demo-banner">
        <strong>SRM UNIVERSITY &bull; DEMO EVALUATION BUILD</strong>
        <span>
          Sample verified data for class demonstration. This site is not monitored by university emergency dispatchers.
        </span>
      </div>

      {/* Global Navigation Header with SRM University Branding */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        staffUser={staffUser}
        onOpenStaffModal={() => handleTabChange('staff')}
        studentSession={studentSession}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleTabChange}
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

        {activeTab === 'signin' && (
          <SignInView
            authService={authService}
            onSuccess={handleSignInSuccess}
            noticeMessage={authNotice}
          />
        )}

        {/* Protected Profile View */}
        {activeTab === 'profile' && studentSession && (
          <ProfileView
            authService={authService}
            session={studentSession}
            onProfileUpdated={handleProfileUpdated}
            onSignOut={handleSignOut}
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
              <ShieldAlert size={18} /> SRM University &bull; Campus Assist System
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Designed & Engineered for SRM University by <strong>Ishika</strong>, <strong>Tishya</strong>, <strong>Krisha</strong>, and <strong>Vansh</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem' }}>
            <span>Architecture: <strong>SOLID Compliant</strong></span>
            <span>Security: <strong>Web Crypto SHA-256</strong></span>
            <span>Timezone: <strong>Asia/Kolkata (IST)</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

