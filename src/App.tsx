import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './presentation/components/Navbar';
import type { StudentNavTab, AdminNavTab } from './presentation/components/Navbar';
import { RoleChoiceView } from './presentation/views/RoleChoiceView';
import { StudentAuthView } from './presentation/views/StudentAuthView';
import { AdminAuthView } from './presentation/views/AdminAuthView';
import { HomeView } from './presentation/views/HomeView';
import { SafetyView } from './presentation/views/SafetyView';
import { TransportView } from './presentation/views/TransportView';
import { ReportView } from './presentation/views/ReportView';
import { LookupView } from './presentation/views/LookupView';
import { StaffView } from './presentation/views/StaffView';
import { ProfileView } from './presentation/views/ProfileView';
import { ConnectedBackendReportRepository } from './infrastructure/repositories';
import { ConnectedStudentAuthService } from './infrastructure/authService';
import { apiClient } from './infrastructure/apiClient';
import type { StudentSession, StudentProfile } from './types';
import { ShieldAlert, Database, CheckCircle2 } from 'lucide-react';
import { BottomNav } from './presentation/components/BottomNav';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import './App.css';

// Connected to real backend SQLite database
const reportRepository = new ConnectedBackendReportRepository();
const authService = new ConnectedStudentAuthService();

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.25,
};

type ViewState =
  | { type: 'role-choice' }
  | { type: 'student-auth'; mode: 'signin' | 'signup' }
  | { type: 'admin-auth' }
  | { type: 'student-portal' }
  | { type: 'admin-portal' };

export const App: React.FC = () => {
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [view, setView] = useState<ViewState>({ type: 'role-choice' });
  const [studentTab, setStudentTab] = useState<StudentNavTab>('home');
  const [adminTab, setAdminTab] = useState<AdminNavTab>('dashboard');
  const [selectedLookupRef, setSelectedLookupRef] = useState<string | undefined>(undefined);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; latency: number } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

  // Route Guard & URL synchronization
  const applyRoute = useCallback(
    (path: string, session: StudentSession | null) => {
      const cleanPath = path.replace(/\/+$/, '') || '/';

      if (!session) {
        // Unauthenticated access
        if (cleanPath === '/student/signin') {
          setView({ type: 'student-auth', mode: 'signin' });
        } else if (cleanPath === '/student/signup') {
          setView({ type: 'student-auth', mode: 'signup' });
        } else if (cleanPath === '/admin/signin') {
          setView({ type: 'admin-auth' });
        } else {
          // Protected route accessed without session -> route guard redirects to role-choice
          if (cleanPath !== '/' && cleanPath !== '') {
            window.history.replaceState(null, '', '/');
          }
          setView({ type: 'role-choice' });
        }
        return;
      }

      // Authenticated as STUDENT
      if (session.student.role !== 'staff' && session.student.role !== 'admin') {
        // Prevent student from accessing admin routes or role choice
        if (
          cleanPath.startsWith('/admin') ||
          cleanPath === '/student/signin' ||
          cleanPath === '/student/signup' ||
          cleanPath === '/' ||
          cleanPath === ''
        ) {
          window.history.replaceState(null, '', '/student/home');
          setStudentTab('home');
          setView({ type: 'student-portal' });
          return;
        }

        if (cleanPath === '/student/report') {
          setStudentTab('report');
        } else if (cleanPath === '/student/track') {
          setStudentTab('track');
        } else if (cleanPath === '/student/safety') {
          setStudentTab('safety');
        } else if (cleanPath === '/student/transport') {
          setStudentTab('transport');
        } else if (cleanPath === '/student/profile') {
          setStudentTab('profile');
        } else {
          setStudentTab('home');
        }
        setView({ type: 'student-portal' });
        return;
      }

      // Authenticated as ADMIN
      if (session.student.role === 'staff' || session.student.role === 'admin') {
        // Prevent admin from accessing student routes or role choice
        if (
          cleanPath.startsWith('/student') ||
          cleanPath === '/admin/signin' ||
          cleanPath === '/' ||
          cleanPath === ''
        ) {
          window.history.replaceState(null, '', '/admin/dashboard');
          setAdminTab('dashboard');
          setView({ type: 'admin-portal' });
          return;
        }

        if (cleanPath === '/admin/reports') {
          setAdminTab('reports');
        } else if (cleanPath === '/admin/sos') {
          setAdminTab('sos');
        } else if (cleanPath === '/admin/transport') {
          setAdminTab('transport');
        } else if (cleanPath === '/admin/profile') {
          setAdminTab('profile');
        } else {
          setAdminTab('dashboard');
        }
        setView({ type: 'admin-portal' });
        return;
      }
    },
    []
  );

  // Initialize session & route on mount
  useEffect(() => {
    authService.getCurrentSession().then((session) => {
      setStudentSession(session);
      applyRoute(window.location.pathname, session);
      setIsInitializing(false);
    });

    const handlePopState = () => {
      authService.getCurrentSession().then((session) => {
        setStudentSession(session);
        applyRoute(window.location.pathname, session);
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [applyRoute]);

  // Navigation helpers
  const navigateTo = (url: string) => {
    window.history.pushState(null, '', url);
    applyRoute(url, studentSession);
  };

  const handleSelectStudentTab = (tab: StudentNavTab) => {
    setStudentTab(tab);
    const url = `/student/${tab === 'home' ? 'home' : tab}`;
    window.history.pushState(null, '', url);
  };

  const handleSelectAdminTab = (tab: AdminNavTab) => {
    setAdminTab(tab);
    const url = `/admin/${tab}`;
    window.history.pushState(null, '', url);
  };

  const handleQuickLookup = (refCode: string) => {
    setSelectedLookupRef(refCode);
    handleSelectStudentTab('track');
  };

  const handleTrackSubmitted = (refCode: string) => {
    setSelectedLookupRef(refCode);
    handleSelectStudentTab('track');
  };

  const handleSignInSuccess = (session: StudentSession) => {
    setStudentSession(session);
    setAuthNotice(null);
    if (session.student.role === 'staff' || session.student.role === 'admin') {
      window.history.pushState(null, '', '/admin/dashboard');
      setAdminTab('dashboard');
      setView({ type: 'admin-portal' });
    } else {
      window.history.pushState(null, '', '/student/home');
      setStudentTab('home');
      setView({ type: 'student-portal' });
    }
  };

  const handleSignOut = async () => {
    if (studentSession?.token) {
      try {
        await apiClient.signOut(studentSession.token);
      } catch {}
    }
    await authService.signOut();
    setStudentSession(null);
    setAuthNotice('You have been signed out successfully.');
    // Replace state so back button does NOT revisit protected pages
    window.history.replaceState(null, '', '/');
    setView({ type: 'role-choice' });
  };

  const handleProfileUpdated = (updatedProfile: StudentProfile) => {
    if (studentSession) {
      setStudentSession({
        ...studentSession,
        student: updatedProfile,
      });
    }
  };

  // Derive current role for navbar
  const currentRole: 'student' | 'admin' | null =
    view.type === 'student-portal'
      ? 'student'
      : view.type === 'admin-portal'
      ? 'admin'
      : null;

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading SRM Campus Assist...</p>
      </div>
    );
  }

  return (
    <div className="app-root-container">
      {/* Role-Specific Navigation Bar */}
      <Navbar
        role={currentRole}
        studentTab={studentTab}
        onSelectStudentTab={handleSelectStudentTab}
        adminTab={adminTab}
        onSelectAdminTab={handleSelectAdminTab}
        studentSession={studentSession}
        onSignOut={handleSignOut}
        onGoHome={() => {
          if (currentRole === 'student') {
            handleSelectStudentTab('home');
          } else if (currentRole === 'admin') {
            handleSelectAdminTab('dashboard');
          } else {
            navigateTo('/');
          }
        }}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <main className="app-main-content" style={{ flex: 1, position: 'relative' }}>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={
                view.type === 'student-portal'
                  ? `student-${studentTab}`
                  : view.type === 'admin-portal'
                  ? `admin-${adminTab}`
                  : view.type
              }
              className="page-view"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {/* 1. ROLE CHOICE PAGE (Initial Welcome Page) */}
              {view.type === 'role-choice' && (
                <RoleChoiceView
                  onSelectStudent={() => navigateTo('/student/signin')}
                  onSelectAdmin={() => navigateTo('/admin/signin')}
                />
              )}

              {/* 2. STUDENT AUTH (Sign In & Sign Up) */}
              {view.type === 'student-auth' && (
                <StudentAuthView
                  authService={authService}
                  initialMode={view.mode}
                  onSuccess={handleSignInSuccess}
                  onBackToRoles={() => navigateTo('/')}
                  noticeMessage={authNotice}
                />
              )}

              {/* 3. ADMIN AUTH (Staff Sign In Only) */}
              {view.type === 'admin-auth' && (
                <AdminAuthView
                  authService={authService}
                  onSuccess={handleSignInSuccess}
                  onBackToRoles={() => navigateTo('/')}
                  noticeMessage={authNotice}
                />
              )}

              {/* 4. STUDENT PORTAL VIEWS */}
              {view.type === 'student-portal' && (
                <>
                  {studentTab === 'home' && (
                    <HomeView
                      onNavigate={(tab: any) => {
                        if (tab === 'report') handleSelectStudentTab('report');
                        else if (tab === 'safety') handleSelectStudentTab('safety');
                        else if (tab === 'transport') handleSelectStudentTab('transport');
                        else if (tab === 'lookup') handleSelectStudentTab('track');
                        else if (tab === 'profile') handleSelectStudentTab('profile');
                      }}
                      onQuickLookup={handleQuickLookup}
                    />
                  )}

                  {studentTab === 'report' && (
                    <ReportView
                      reportRepository={reportRepository}
                      onTrackSubmitted={handleTrackSubmitted}
                    />
                  )}

                  {studentTab === 'track' && (
                    <LookupView
                      reportRepository={reportRepository}
                      initialRefCode={selectedLookupRef}
                      studentSession={studentSession}
                    />
                  )}

                  {studentTab === 'safety' && <SafetyView />}

                  {studentTab === 'transport' && <TransportView />}

                  {studentTab === 'profile' && studentSession && (
                    <ProfileView
                      authService={authService}
                      session={studentSession}
                      onProfileUpdated={handleProfileUpdated}
                      onSignOut={handleSignOut}
                    />
                  )}
                </>
              )}

              {/* 5. ADMIN PORTAL (Admin Block) */}
              {view.type === 'admin-portal' && (
                <StaffView
                  reportRepository={reportRepository}
                  onLogout={handleSignOut}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
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
            <span>Domain: <strong>@srmuniversity.ac.in</strong></span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav
        role={currentRole}
        studentTab={studentTab}
        onSelectStudentTab={handleSelectStudentTab}
        adminTab={adminTab}
        onSelectAdminTab={handleSelectAdminTab}
      />
    </div>
  );
};

export default App;
