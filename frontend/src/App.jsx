import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SplashScreen } from './components/SplashScreen';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CreateEvent } from './pages/admin/CreateEvent';
import { EventDetails } from './pages/admin/EventDetails';
import { TeamDashboard } from './pages/team/TeamDashboard';
import { AssignedEvent } from './pages/team/AssignedEvent';
import { MyPhotos } from './pages/team/MyPhotos';
import { CustomerGallery } from './pages/customer/CustomerGallery';

// App Layout with Sidebar & Clean Light Content Area
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Root index redirect based on role
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/team/dashboard" replace />;
};

function App() {
  // Never show splash animation on galleries or if already seen this session
  const isGalleryRoute =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/gallery');

  const [showSplash, setShowSplash] = useState(
    () => !isGalleryRoute && !sessionStorage.getItem('photoshare_splash_shown')
  );

  const handleSplashFinish = () => {
    sessionStorage.setItem('photoshare_splash_shown', '1');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Gallery (No account required) */}
          <Route path="/gallery/:publicToken" element={<CustomerGallery />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <CreateEvent />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <EventDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Team Member Protected Routes */}
          <Route
            path="/team/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                <DashboardLayout>
                  <TeamDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/events/:id"
            element={
              <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                <DashboardLayout>
                  <AssignedEvent />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/my-photos"
            element={
              <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                <DashboardLayout>
                  <MyPhotos />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Root Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
