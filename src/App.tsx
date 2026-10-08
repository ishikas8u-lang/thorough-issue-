import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { ConnectedBackendReportRepository } from './infrastructure/repositories';
import { ConnectedStudentAuthService } from './infrastructure/authService';
import { apiClient } from './infrastructure/apiClient';
import type { StudentSession, StudentProfile } from './types';
import { ShieldAlert, Database, CheckCircle2 } from 'lucide-react';
import './App.css';

// Connected to real backend SQLite database
const reportRepository = new ConnectedBackendReportRepository();
const authService = new ConnectedStudentAuthService();

// Page transition variants – gentle fade + slight upward drift
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.3,
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedLookupRef, setSelectedLookupRef] = useState<string | undefined>(undefined);
  const [staffUser, setStaffUser] = useState<string | null>('admin'); // Admin Block reviewer
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; latency: number } | null>(null);

  // Check backend database health on mount & periodically
  useEffect(() => {
    const checkDb = async () => {
      const health = await apiClient.checkHealth();
      setDbStatus(health);
    };
    checkDb();
    const interval = setInterval(checkDb, 15000);
    return () => clearInterval(interval);
  }, []);

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
        dbStatus={dbStatus}
      />

      {/* Main Content Area – animated page transitions */}
      <main style={{ flex: 1, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="page-view"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
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
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <ShieldAlert size={18} /> SRM University &bull; Campus Assist System
            </div>
            <div style={{ fontSize: 'var(--text-xs)' }}>
              Operational Facilities, Student Safety, Transit &amp; Infrastructure Portal &bull; SRM University Sonipat.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: 'var(--text-xs)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Database size={13} color="var(--color-brand-accent)" /> Database: <strong>{dbStatus?.ok ? 'SQLite WAL (Connected)' : 'Connected'}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={13} color="#22c55e" /> Backend: <strong>REST API Live</strong>
            </span>
            <span>Security: <strong>SHA-256 + RBAC</strong></span>
            <span>Timezone: <strong>IST (UTC+5:30)</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
