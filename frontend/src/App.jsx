import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LandingPage from '@/pages/LandingPage';
import VerifyPage from '@/pages/VerifyPage';
import HistoryPage from '@/pages/HistoryPage';
import AdminPage from '@/pages/AdminPage';
import { Toaster } from 'sonner';

import { BGPattern } from '@/components/ui/bg-pattern';

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] z-0 isolate">
      <BGPattern 
        variant="checkerboard" 
        size={48} 
        fill="#cbd5e1" 
        mask="fade-bottom" 
        className="pointer-events-none fixed opacity-40" 
      />
      <Navbar />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" richColors closeButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
