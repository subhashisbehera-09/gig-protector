const API_BASE_URL = 'http://localhost:8000';

let authToken = localStorage.getItem('token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => authToken || localStorage.getItem('token');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithAuth(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const apiService = {
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  async register(data) {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return fetchWithAuth('/auth/me');
  },

  async getWorkerProfile() {
    return fetchWithAuth('/workers/profile');
  },

  async createWorkerProfile(data) {
    return fetchWithAuth('/workers/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWorkerProfile(data) {
    return fetchWithAuth('/workers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getWorkerEarnings() {
    return fetchWithAuth('/workers/earnings');
  },

  async getZoneInfo(zoneId) {
    return fetchWithAuth(`/workers/zone/${zoneId}`);
  },

  async getPremiums() {
    return fetchWithAuth('/premiums');
  },

  async createPremium(data) {
    return fetchWithAuth('/premiums', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyPremium() {
    return fetchWithAuth('/premiums/me');
  },

  async getTriggers() {
    return fetchWithAuth('/triggers');
  },

  async getMyTriggers() {
    return fetchWithAuth('/triggers/me');
  },

  async createTrigger(data) {
    return fetchWithAuth('/triggers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getClaims() {
    return fetchWithAuth('/claims');
  },

  async getMyClaims() {
    return fetchWithAuth('/claims/me');
  },

  async createClaim(data) {
    return fetchWithAuth('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createPaymentOrder(amount) {
    return fetchWithAuth('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: amount * 100, currency: 'INR' }),
    });
  },

  async verifyPayment(data) {
    return fetchWithAuth('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getQRCode(amount) {
    return fetchWithAuth(`/payments/qr-code/${amount}`);
  },

  async getQRImage(amount) {
    return fetchWithAuth(`/payments/qr-image/${amount}`);
  },

  async getWeatherData(city) {
    const coords = {
      mumbai: { lat: 19.076, lon: 72.8777 },
      delhi: { lat: 28.7041, lon: 77.1025 },
      bengaluru: { lat: 12.9716, lon: 77.5946 },
      chennai: { lat: 13.0827, lon: 80.2707 },
      hyderabad: { lat: 17.385, lon: 78.4867 },
    };

    try {
      const { lat, lon } = coords[city] || coords.mumbai;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain,visibility,humidity&timezone=auto`
      );

      if (!response.ok) throw new Error('API unavailable');

      const data = await response.json();
      return {
        temperature: data.current?.temperature_2m || 32,
        rain: data.current?.rain || 0,
        visibility: data.current?.visibility || 10000,
        humidity: data.current?.humidity || 60,
        source: 'Open-Meteo API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        temperature: 32,
        rain: 0,
        visibility: 10000,
        humidity: 60,
        source: 'Cached/Mock Data',
        timestamp: new Date().toISOString(),
        error: 'Live API unavailable'
      };
    }
  },

  async getAirQuality(city) {
    try {
      const aqi = city === 'delhi' ? 456 : city === 'mumbai' ? 156 : 85;
      return {
        aqi,
        category: aqi > 400 ? 'SEVERE' : aqi > 200 ? 'VERY POOR' : aqi > 100 ? 'MODERATE' : 'GOOD',
        source: 'CPCB Safar (simulated)',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { aqi: 100, category: 'MODERATE', source: 'Error' };
    }
  },

  async getZoneRiskData(zoneId) {
    const zoneRisks = {
      andheri_west: { floodRisk: 0.72, pollutionScore: 45, heatIndex: 38, disruptionDays: 18 },
      kurla: { floodRisk: 0.68, pollutionScore: 52, heatIndex: 37, disruptionDays: 16 },
      bandra: { floodRisk: 0.35, pollutionScore: 38, heatIndex: 36, disruptionDays: 8 },
      dadar: { floodRisk: 0.42, pollutionScore: 41, heatIndex: 37, disruptionDays: 10 },
      colaba: { floodRisk: 0.12, pollutionScore: 28, heatIndex: 35, disruptionDays: 3 },
    };

    return zoneRisks[zoneId] || zoneRisks.andheri_west;
  },

  async getWorkerDashboard() {
    return fetchWithAuth('/dashboard/worker');
  },

  async getAdminDashboard() {
    return fetchWithAuth('/dashboard/admin');
  },

  async getEarningsProtection() {
    return fetchWithAuth('/dashboard/earnings-protection');
  },

  async getCoverageStatus() {
    return fetchWithAuth('/dashboard/coverage-status');
  },

  async getLossRatio() {
    return fetchWithAuth('/dashboard/admin/loss-ratio');
  },

  async getPredictions() {
    return fetchWithAuth('/dashboard/admin/predictions');
  },

  async getWeatherForecast() {
    return fetchWithAuth('/dashboard/admin/weather-forecast');
  },

  async getFraudSummary() {
    return fetchWithAuth('/dashboard/admin/fraud-summary');
  },

  async initiateInstantPayout(claimId, gateway = 'upi') {
    return fetchWithAuth('/payouts/instant', {
      method: 'POST',
      body: JSON.stringify({ claim_id: claimId, gateway }),
    });
  },

  async getPaymentOptions() {
    return fetchWithAuth('/payouts/options');
  },

  async getPayoutStatus(payoutId) {
    return fetchWithAuth(`/payouts/status/${payoutId}`);
  },

  async getPayoutHistory() {
    return fetchWithAuth('/payouts/history');
  },

  async getClaimFraudAnalysis(claimId) {
    return fetchWithAuth(`/claims/${claimId}/fraud-analysis`);
  },

  async post(endpoint, data) {
    return fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async patch(endpoint, data) {
    return fetchWithAuth(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return fetchWithAuth(endpoint, {
      method: 'DELETE',
    });
  },
};

export const api = apiService;
export default apiService;

// For direct access
export const post = apiService.post.bind(apiService);
export const patch = apiService.patch.bind(apiService);
export const put = apiService.put.bind(apiService);
export const del = apiService.delete.bind(apiService);