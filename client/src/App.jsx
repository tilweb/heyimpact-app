import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DocumentImportPage from './pages/DocumentImportPage.jsx';
import OrganizationPage from './pages/OrganizationPage.jsx';
import IROAssessmentPage from './pages/IROAssessmentPage.jsx';
import MaterialityPage from './pages/MaterialityPage.jsx';
import EnvironmentalPage from './pages/EnvironmentalPage.jsx';
import SocialPage from './pages/SocialPage.jsx';
import GovernancePage from './pages/GovernancePage.jsx';
import TargetsActionsPage from './pages/TargetsActionsPage.jsx';
import CockpitPage from './pages/CockpitPage.jsx';
import ExportPage from './pages/ExportPage.jsx';
import TodoListPage from './pages/TodoListPage.jsx';
import VsmePage from './pages/VsmePage.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="cockpit" element={<CockpitPage />} />
        <Route path="import" element={<DocumentImportPage />} />
        <Route path="organization" element={<OrganizationPage />} />
        <Route path="iro" element={<IROAssessmentPage />} />
        <Route path="materiality" element={<MaterialityPage />} />
        <Route path="environmental" element={<EnvironmentalPage />} />
        <Route path="social" element={<SocialPage />} />
        <Route path="governance" element={<GovernancePage />} />
        <Route path="targets" element={<TargetsActionsPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="vsme" element={<VsmePage />} />
        <Route path="todos" element={<TodoListPage />} />
      </Route>
    </Routes>
  );
}
