import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TestCreationPage } from '../pages/TestCreationPage';
import { AddQuestionsPage } from '../pages/AddQuestionsPage';
import { PreviewPublishPage } from '../pages/PreviewPublishPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/test/create" element={<TestCreationPage />} />
            <Route path="/test/:id/edit" element={<TestCreationPage />} />
            <Route path="/test/:id/questions" element={<AddQuestionsPage />} />
            <Route path="/test/:id/preview" element={<PreviewPublishPage />} />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
