import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.js';

// Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage.js'));
const LoginPage = lazy(() => import('./pages/public/LoginPage.js'));
const SignupPage = lazy(() => import('./pages/public/SignupPage.js'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage.js'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage.js'));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage.js'));

// Protected Pages
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage.js'));
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage.js'));
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage.js'));
const ProjectDetailPage = lazy(() => import('./pages/projects/ProjectDetailPage.js'));
const ProjectBoardPage = lazy(() => import('./pages/projects/ProjectBoardPage.js'));
const MyTasksPage = lazy(() => import('./pages/tasks/MyTasksPage.js'));
const TeamPage = lazy(() => import('./pages/team/TeamPage.js'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage.js'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage.js'));
const ProfilePage = lazy(() => import('./pages/settings/ProfilePage.js'));

const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="projects/:projectId/board" element={<ProjectBoardPage />} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
