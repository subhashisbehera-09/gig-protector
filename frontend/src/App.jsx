import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LoadingScreen } from './components/LoadingScreen';
import { SOSButton } from './components/SOSButton';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminClaims = lazy(() => import('./pages/AdminClaims').then(m => ({ default: m.AdminClaims })));
const AdminFraud = lazy(() => import('./pages/AdminFraud').then(m => ({ default: m.AdminFraud })));
const AdminReports = lazy(() => import('./pages/AdminReports').then(m => ({ default: m.AdminReports })));
const SafetyDashboard = lazy(() => import('./pages/SafetyDashboard').then(m => ({ default: m.SafetyDashboard })));
const Policy = lazy(() => import('./pages/Policy').then(m => ({ default: m.Policy })));
const Premium = lazy(() => import('./pages/Premium').then(m => ({ default: m.Premium })));
const Claims = lazy(() => import('./pages/Claims').then(m => ({ default: m.Claims })));
const Triggers = lazy(() => import('./pages/Triggers').then(m => ({ default: m.Triggers })));

const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#1a1a2e',
    color: '#fff'
  }}>
    Loading...
  </div>
);

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLoadingComplete = () => {
    console.log('Loading complete, hiding screen');
    setShowLoading(false);
  };

  return (
    <>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {isHomePage && <AnimatedBackground />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/fraud" element={<AdminFraud />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/safety" element={<SafetyDashboard />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/triggers" element={<Triggers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!isHomePage && <SOSButton />}
        <Navbar />
        <ToastContainer />
      </Suspense>
    </>
  );
}

export default App;