const API_BASE = '/api';

const getToken = () => localStorage.getItem('medicycle_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  // Public / User Medicines
  getApprovedMedicines: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/medicines${queryString ? `?${queryString}` : ''}`);
  },

  getMedicineById: (id) => request(`/medicines/${id}`),
  getMedicineJourney: (id) => request(`/medicines/${id}/journey`),

  submitMedicine: (medicineData) =>
    request('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    }),

  getMySubmissions: () => request('/medicines/my'),

  // Notifications
  getMyNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', {
      method: 'PUT',
    }),

  // Requests
  createRequest: (requestData) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),

  getMyRequests: () => request('/requests/my'),

  // MediPoints
  getMyMediPoints: () => request('/medipoints/my'),
  calculateMediPointsDiscount: (accessFee) =>
    request(`/medipoints/calculate-discount?accessFee=${encodeURIComponent(accessFee)}`),
  getAdminMediPointsActivity: () => request('/medipoints/admin-activity'),

  // Admin
  getPendingMedicines: () => request('/admin/medicines/pending'),
  getAllMedicines: () => request('/admin/medicines/all'),
  approveMedicine: (id) =>
    request(`/admin/medicines/${id}/approve`, {
      method: 'PUT',
    }),
  rejectMedicine: (id, rejectionReason) =>
    request(`/admin/medicines/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    }),

  getAdminRequests: () => request('/admin/requests'),
  updateRequestStatus: (id, status, adminNotes = '') =>
    request(`/admin/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    }),

  getAdminStats: () => request('/admin/stats'),
  getExpiryAlerts: () => request('/admin/expiry-alerts'),
  resetDemo: () =>
    request('/admin/reset-demo', {
      method: 'POST',
    }),

  // Admin Command Center API
  getAdminOverview: () => request('/admin/overview'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  toggleUserStatus: (id) =>
    request(`/admin/users/${id}/toggle-status`, {
      method: 'PUT',
    }),
  getAdminPharmacists: () => request('/admin/pharmacists'),
  getAdminAuditLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
  },
  getAdminActivity: () => request('/admin/activity'),
  getAdminAnalytics: () => request('/admin/analytics'),
  getAdminAlerts: () => request('/admin/alerts'),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (settings) =>
    request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Public Impact Stats
  getPublicStats: () => request('/stats/public'),

  // Pre-check eligibility
  checkEligibility: (payload) =>
    request('/medicines/check-eligibility', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default api;
