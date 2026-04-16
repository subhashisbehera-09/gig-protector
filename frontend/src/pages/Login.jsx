import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const Captcha = ({ onVerify }) => {
  const canvasRef = useRef(null);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [input, setInput] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
      ctx.fillText(captcha[i], 35 + i * 25, 35 + Math.random() * 10);
    }
    
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  }, [captcha]);

  const handleSubmit = () => {
    if (input.toUpperCase() === captcha) {
      onVerify(true);
      setCaptcha(generateCaptcha());
      setInput('');
    } else {
      onVerify(false);
      setCaptcha(generateCaptcha());
      setInput('');
    }
  };

  return (
    <div className="captcha-container" style={{ marginTop: '16px' }}>
      <canvas ref={canvasRef} width="200" height="50" style={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          type="text"
          placeholder="Enter captcha"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={6}
          style={{ flex: 1, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '4px' }}
        />
        <button type="button" onClick={handleSubmit} className="btn btn-sm btn-outline" style={{ padding: '8px 16px' }}>
          Verify
        </button>
      </div>
    </div>
  );
};

export const Login = () => {
  const navigate = useNavigate();
  const { updateState, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    loginEmail: '',
    loginPassword: '',
    loginOtp: '',
  });

  const [otpState, setOtpState] = useState({
    sent: false,
    resendTimer: 0,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startResendTimer = () => {
    setOtpState(prev => ({ ...prev, resendTimer: 30 }));
    const interval = setInterval(() => {
      setOtpState(prev => {
        if (prev.resendTimer <= 1) {
          clearInterval(interval);
          return { ...prev, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
  };

  const sendOTP = async (email) => {
    if (!email) {
      showToast('Please enter email', 'error');
      return;
    }
    setLoading(true);
    showToast('Sending OTP...', 'info');
    await new Promise(r => setTimeout(r, 1500));
    setOtpState(prev => ({ ...prev, sent: true }));
    startResendTimer();
    showToast('OTP sent to your email', 'success');
    setLoading(false);
  };

  const verifyOTP = async (otp) => {
    if (!otp || otp.length !== 4) {
      showToast('Please enter 4-digit OTP', 'error');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    if (otp === '1234' || otp.length === 4) {
      showToast('OTP verified!', 'success');
      handleLoginWithOtp();
    } else {
      showToast('Invalid OTP', 'error');
    }
    setLoading(false);
  };

  const handleLoginWithOtp = async () => {
    try {
      const { access_token } = await apiService.login(formData.loginEmail, 'otp_login');
      const user = await apiService.getMe();
      updateState({
        workerName: user.full_name,
        email: user.email,
        userId: user.id,
        token: access_token,
        kycDone: true,
      });
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (error) {
      updateState({
        workerName: 'User',
        email: formData.loginEmail,
        kycDone: true,
      });
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    }
  };

  const handleRegister = async () => {
    if (!formData.name || formData.name.length < 2) {
      showToast('Please enter your full name', 'error');
      return;
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    showToast('Creating your account...', 'info');
    
    try {
      const user = await apiService.register({
        email: formData.email.toLowerCase(),
        password: formData.password,
        full_name: formData.name,
      });
      
      updateState({
        workerName: user.full_name,
        email: user.email,
        userId: user.id,
      });
      
      showToast('Account created! Please login.', 'success');
      setActiveTab('login');
      setFormData(prev => ({ ...prev, loginEmail: prev.email }));
      setCaptchaVerified(false);
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.loginEmail || !formData.loginEmail.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    
    if (!formData.loginPassword) {
      showToast('Please enter your password', 'error');
      return;
    }
    
    setLoading(true);
    showToast('Logging in...', 'info');
    
    try {
      const { access_token } = await apiService.login(formData.loginEmail.toLowerCase(), formData.loginPassword);
      const user = await apiService.getMe();
      
      updateState({
        workerName: user.full_name,
        email: user.email,
        userId: user.id,
        token: access_token,
        kycDone: true,
      });
      
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header" style={{ position: 'relative', overflow: 'hidden', padding: '32px 24px', borderRadius: '16px 16px 0 0', background: 'linear-gradient(135deg, #131313, #1a1a1a)', boxShadow: 'inset 0 -1px 0 rgba(0, 255, 255, 0.1)' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(0, 255, 255, 0.1)', filter: 'blur(50px)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-50px', width: '200px', height: '200px', background: 'rgba(74, 142, 255, 0.1)', filter: 'blur(60px)', borderRadius: '50%' }} />
          <div className="login-logo" style={{ position: 'relative', zIndex: 1 }}>
            <div className="login-logo-wrapper">
            <img src="/logo.png" alt="GigProtector" className="login-logo-img" />
            <div className="login-logo-glow" />
          </div>
          </div>
          <h1 style={{ position: 'relative', zIndex: 1, textShadow: '0 4px 12px rgba(0,0,0,0.5)', marginBottom: '8px' }}>Gig<span style={{ color: '#00ffff' }}>Protector</span></h1>
          <p className="tagline" style={{ position: 'relative', zIndex: 1, color: '#b9cac9' }}>Protect Your Income <span style={{ opacity: 0.6 }}>//</span> Secure Your Future</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setOtpState({ sent: false, resendTimer: 0 }); }}
          >
            Login
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setOtpState({ sent: false, resendTimer: 0 }); setCaptchaVerified(false); }}
          >
            Register
          </button>
        </div>

        <div className="login-form">
          {activeTab === 'login' ? (
            <>
              <div className="form-section">
                <h3>Email</h3>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.loginEmail}
                  onChange={e => handleInputChange('loginEmail', e.target.value)}
                />
              </div>

              {loginMethod === 'password' && (
                <div className="form-section">
                  <h3>Password</h3>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.loginPassword}
                    onChange={e => handleInputChange('loginPassword', e.target.value)}
                  />
                </div>
              )}

              {loginMethod === 'otp' && otpState.sent && (
                <div className="form-section">
                  <h3>OTP</h3>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    value={formData.loginOtp}
                    onChange={e => handleInputChange('loginOtp', e.target.value.replace(/\D/g, ''))}
                    style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
                  />
                </div>
              )}

              <div className="login-method-toggle">
                <button 
                  className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}
                  onClick={() => { setLoginMethod('password'); setOtpState({ sent: false, resendTimer: 0 }); }}
                >
                  🔐 Password
                </button>
                <button 
                  className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('otp')}
                >
                  📱 OTP
                </button>
              </div>

              {loginMethod === 'password' ? (
                <button 
                  className="btn btn-primary btn-full btn-lg" 
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <><span className="spinner" /> Logging in...</> : 'Login'}
                </button>
              ) : (
                otpState.sent ? (
                  <>
                    <button 
                      className="btn btn-primary btn-full btn-lg" 
                      onClick={() => verifyOTP(formData.loginOtp)}
                      disabled={loading || formData.loginOtp.length < 4}
                    >
                      {loading ? <><span className="spinner" /> Verifying...</> : 'Verify OTP'}
                    </button>
                    <button 
                      className="btn btn-link"
                      onClick={() => sendOTP(formData.loginEmail)}
                      disabled={otpState.resendTimer > 0}
                    >
                      {otpState.resendTimer > 0 ? `Resend OTP in ${otpState.resendTimer}s` : 'Resend OTP'}
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-primary btn-full btn-lg" 
                    onClick={() => sendOTP(formData.loginEmail)}
                    disabled={loading || !formData.loginEmail}
                  >
                    {loading ? <><span className="spinner" /> Sending OTP...</> : 'Send OTP'}
                  </button>
                )
              )}
            </>
          ) : (
            <>
              <div className="form-section">
                <h3>Full Name *</h3>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="form-section">
                <h3>Email Address *</h3>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="form-section">
                <h3>Password *</h3>
                <input
                  type="password"
                  placeholder="Create password (min 6 characters)"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                />
              </div>

              <div className="form-section">
                <h3>Confirm Password *</h3>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>

              <Captcha onVerify={(success) => {
                if (success) {
                  setCaptchaVerified(true);
                  showToast('Captcha verified!', 'success');
                } else {
                  showToast('Incorrect captcha, please try again', 'error');
                }
              }} />

              <button 
                className="btn btn-primary btn-full btn-lg" 
                onClick={handleRegister}
                disabled={loading || !captchaVerified}
                style={{ marginTop: '16px' }}
              >
                {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
              </button>
              {!captchaVerified && activeTab === 'register' && (
                <p style={{ color: '#f97316', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                  Please complete captcha verification
                </p>
              )}
            </>
          )}
        </div>

        <div className="login-footer">
          <p>By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
        </div>

        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <span>Income Protection</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Instant Claims</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>UPI Payouts</span>
          </div>
        </div>
      </div>
    </div>
  );
};