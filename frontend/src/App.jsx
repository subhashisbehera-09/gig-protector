import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { AnimatedBackground } from './components/AnimatedBackground';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {isHomePage && <AnimatedBackground />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/triggers" element={<Triggers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navbar />
        <ToastContainer />
      </Suspense>
    </>
  );
}

export default App;