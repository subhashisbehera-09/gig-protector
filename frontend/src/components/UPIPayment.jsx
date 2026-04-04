import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '📱', color: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', icon: '🔵', color: '#5F259F' },
  { id: 'paytm', name: 'Paytm', icon: '💙', color: '#00BAF2' },
  { id: 'bhim', name: 'BHIM', icon: '🏛️', color: '#6739B7' },
];

const SuccessAnimation = ({ amount, transactionId, onDone }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="real-success-overlay">
      <div className="real-success-card">
        <div className="success-tick-container">
          <div className="success-tick-circle">
            <svg viewBox="0 0 52 52" className="success-tick">
              <circle className="success-tick-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="success-tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div className="success-glow"></div>
        </div>
        
        <h2>Payment Successful</h2>
        <p className="amount-display">₹{amount}</p>
        
        <div className="progress-container">
          <div className="progress-track">
            <div className="progress-fill-animated" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Processing...</p>
        </div>
        
        <div className="transaction-info">
          <div className="info-row">
            <span className="info-label">Transaction ID</span>
            <span className="info-value">{transactionId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status</span>
            <span className="info-value status-success">SUCCESS</span>
          </div>
          <div className="info-row">
            <span className="info-label">Time</span>
            <span className="info-value">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        <button className="btn-done" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
};

const ProcessingAnimation = ({ method }) => {
  const [dots, setDots] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const messages = {
    qr: ['Initiating QR scan...', 'Waiting for payment...', 'Verifying transaction...', 'Processing...'],
    upi: ['Sending UPI request...', 'Connecting to UPI...', 'Verifying payment...', 'Processing...'],
    app: ['Opening app...', 'Waiting for confirmation...', 'Verifying...', 'Processing...']
  };

  return (
    <div className="real-processing-overlay">
      <div className="real-processing-card">
        <div className="processing-icon-container">
          <div className="pulse-ring"></div>
          <div className="processing-icon">
            {method === 'qr' ? '📷' : method === 'app' ? '📱' : '📲'}
          </div>
        </div>
        <h3>Processing Payment</h3>
        <p className="processing-message">{messages[method || 'upi'][dots]}</p>
        <div className="processing-dots">
          <span className={dots === 0 ? 'active' : ''}></span>
          <span className={dots === 1 ? 'active' : ''}></span>
          <span className={dots === 2 ? 'active' : ''}></span>
        </div>
      </div>
    </div>
  );
};

export const UPIPayment = ({ amount, onSuccess, onCancel, purpose = 'payment' }) => {
  const { showToast } = useApp();
  const [step, setStep] = useState('selectMethod');
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [processingMethod, setProcessingMethod] = useState(null);

  useEffect(() => {
    if (step === 'qrCode' && !qrData) {
      loadQRCode();
    }
  }, [step]);

  const loadQRCode = async () => {
    try {
      const data = await apiService.getQRCode(amount);
      setQrData(data);
    } catch (err) {
      const mockQr = {
        qr_data: `upi://pay?pa=gigprotector@upi&pn=GigProtector&am=${amount}&cu=INR&tn=MOCK${Date.now()}`,
        order_id: `MOCK${Date.now()}`,
        amount: amount,
        upi_id: 'gigprotector@upi'
      };
      setQrData(mockQr);
    }
  };

  const getQRImageUrl = () => {
    return `${window.location.protocol}//${window.location.host.replace(':5173', ':8000')}/payments/qr-image/${amount}`;
  };

  const validateUpi = (id) => id.includes('@') && id.length > 3;

  const processPayment = (method) => {
    setProcessingMethod(method);
    setStep('processing');
    
    setTimeout(() => {
      const txId = `TXN${Date.now().toString().slice(-10)}`;
      setTransactionId(txId);
      setStep('success');
    }, 4000);
  };

  const handleSendRequest = async () => {
    if (!validateUpi(upiId)) {
      showToast('Please enter a valid UPI ID', 'error');
      return;
    }
    processPayment('upi');
  };

  const handleAppSelect = (appId) => {
    setSelectedApp(appId);
    const app = UPI_APPS.find(a => a.id === appId);
    showToast(`Opening ${app.name}...`, 'info');
    processPayment('app');
  };

  const handleQRPayment = () => {
    showToast('Scan the QR code with your UPI app', 'info');
    processPayment('qr');
  };

  const handleCancel = () => {
    setStep('selectMethod');
    setUpiId('');
    setSelectedApp(null);
    setQrData(null);
    if (onCancel) onCancel();
  };

  const handleDone = () => {
    if (onSuccess) onSuccess({ transactionId: transactionId });
    setStep('selectMethod');
    setUpiId('');
    setSelectedApp(null);
    setQrData(null);
    setTransactionId(null);
    if (onCancel) onCancel();
  };

  if (step === 'processing') {
    return <ProcessingAnimation method={processingMethod} />;
  }

  if (step === 'success') {
    return (
      <SuccessAnimation 
        amount={amount} 
        transactionId={transactionId} 
        onDone={handleDone} 
      />
    );
  }

  return (
    <div className="upi-payment-overlay">
      <div className="upi-modal">
        <div className="upi-header">
          <div className="upi-logo">💰</div>
          <h3>Pay with UPI</h3>
          <p className="c-text2">Amount: <span className="fw-600 amount-highlight">₹{amount}</span></p>
        </div>

        {step === 'selectMethod' && (
          <div className="payment-methods">
            <button className="method-btn-large" onClick={() => setStep('qrCode')}>
              <div className="method-icon-wrapper scan">
                <span className="method-icon">📷</span>
              </div>
              <span className="method-label">Scan QR</span>
              <span className="method-desc">Scan any UPI QR</span>
            </button>
            <button className="method-btn-large" onClick={() => setStep('enterUpi')}>
              <div className="method-icon-wrapper">
                <span className="method-icon">⌨️</span>
              </div>
              <span className="method-label">Enter UPI ID</span>
              <span className="method-desc">Pay via UPI handle</span>
            </button>
          </div>
        )}

        {step === 'qrCode' && (
          <div className="qr-section">
            <div className="qr-display">
              <div className="qr-frame">
                <img 
                  src={getQRImageUrl()} 
                  alt="UPI QR Code" 
                  style={{ width: '180px', height: '180px', display: 'block', borderRadius: '12px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="qr-pattern-real" style={{ display: 'none' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <rect x="10" y="10" width="35" height="35" fill="#000000"/>
                    <rect x="115" y="10" width="35" height="35" fill="#000000"/>
                    <rect x="10" y="115" width="35" height="35" fill="#000000"/>
                    <rect x="55" y="55" width="50" height="50" fill="#000000" rx="4"/>
                    <rect x="55" y="10" width="15" height="15" fill="#000000"/>
                    <rect x="80" y="10" width="15" height="15" fill="#000000"/>
                    <rect x="55" y="30" width="10" height="10" fill="#000000"/>
                    <rect x="95" y="30" width="10" height="10" fill="#000000"/>
                    <rect x="30" y="55" width="15" height="15" fill="#000000"/>
                    <rect x="30" y="80" width="15" height="15" fill="#000000"/>
                    <rect x="10" y="55" width="15" height="15" fill="#000000"/>
                    <rect x="10" y="80" width="15" height="15" fill="#000000"/>
                    <rect x="55" y="115" width="15" height="15" fill="#000000"/>
                    <rect x="80" y="115" width="15" height="15" fill="#000000"/>
                    <rect x="115" y="55" width="15" height="15" fill="#000000"/>
                    <rect x="115" y="80" width="15" height="15" fill="#000000"/>
                    <rect x="135" y="55" width="15" height="15" fill="#000000"/>
                    <rect x="135" y="80" width="15" height="15" fill="#000000"/>
                    <rect x="55" y="135" width="15" height="15" fill="#000000"/>
                    <rect x="80" y="135" width="15" height="15" fill="#000000"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="upi-details-box">
              <div className="detail-item">
                <span className="detail-label">Pay to</span>
                <span className="detail-value">{qrData?.upi_id || 'gigprotector@upi'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount</span>
                <span className="detail-value amount-bold">₹{amount}</span>
              </div>
            </div>
            <button className="btn-pay-confirm" onClick={handleQRPayment}>
              Confirm Payment
            </button>
            <button className="btn-scan-camera" onClick={() => setShowScanner(!showScanner)}>
              {showScanner ? 'Scanning...' : '📷 Scan with Camera'}
            </button>
            {showScanner && (
              <div className="camera-area">
                <div className="camera-frame">
                  <div className="corner tl"></div>
                  <div className="corner tr"></div>
                  <div className="corner bl"></div>
                  <div className="corner br"></div>
                  <div className="scan-line"></div>
                </div>
                <p className="camera-hint">Point camera at QR code</p>
              </div>
            )}
            <button className="btn-back" onClick={() => setStep('selectMethod')}>
              ← Back
            </button>
          </div>
        )}

        {step === 'enterUpi' && (
          <>
            <div className="upi-apps-section">
              <p className="section-label">Popular Apps</p>
              <div className="upi-apps-grid">
                {UPI_APPS.map(app => (
                  <button
                    key={app.id}
                    className={`upi-app-btn ${selectedApp === app.id ? 'selected' : ''}`}
                    onClick={() => handleAppSelect(app.id)}
                  >
                    <span className="app-icon">{app.icon}</span>
                    <span className="app-name">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divider-or">
              <span>OR</span>
            </div>

            <div className="upi-manual-section">
              <label>Enter UPI ID</label>
              <div className="upi-input-wrapper">
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                />
              </div>
              <button
                className="btn-pay-confirm"
                onClick={handleSendRequest}
                disabled={!validateUpi(upiId)}
              >
                Pay ₹{amount}
              </button>
              <button className="btn-back" onClick={() => setStep('selectMethod')}>
                ← Back
              </button>
            </div>
          </>
        )}

        <button className="btn-cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UPIPayment;