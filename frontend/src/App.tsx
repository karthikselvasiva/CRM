import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageSpinner } from './components/LoadingSpinner';
import AuthGuard from './components/AuthGuard';

// Lazy-load all page components for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const EmailPage = lazy(() => import('./pages/EmailPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AutomationsPage = lazy(() => import('./pages/AutomationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const App: React.FC = () => {
    return (
        <Suspense fallback={<PageSpinner />}>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes — wrapped in AuthGuard */}
                <Route
                    element={
                        <AuthGuard>
                            <Layout />
                        </AuthGuard>
                    }
                >
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/leads" element={<LeadsPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/email" element={<EmailPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/automations" element={<AutomationsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default App;
