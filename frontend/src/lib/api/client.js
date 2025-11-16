/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Authentication API
 */
export const auth = {
  async register(username, password, email, publicKey, fingerprint) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        email,
        public_key: publicKey,
        public_key_fingerprint: fingerprint,
      }),
    });

    // Store token
    localStorage.setItem('auth_token', data.access_token);
    return data;
  },

  async login(username, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Store token
    localStorage.setItem('auth_token', data.access_token);
    return data;
  },

  async logout() {
    await apiRequest('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },
};

/**
 * Users API
 */
export const users = {
  async getProfile() {
    return apiRequest('/users/me');
  },

  async updateProfile(updates) {
    return apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getUserByHandle(handle) {
    return apiRequest(`/users/${encodeURIComponent(handle)}`);
  },
};

/**
 * Messages API
 */
export const messages = {
  async send(messageData) {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  async getConversation(handle, limit = 50, before = null) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) {
      params.append('before', before);
    }
    return apiRequest(`/messages/conversation/${encodeURIComponent(handle)}?${params}`);
  },

  async markRead(messageId) {
    return apiRequest(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },
};

/**
 * Contacts API
 */
export const contacts = {
  async list() {
    return apiRequest('/contacts');
  },

  async add(contactHandle, nickname = null) {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        contact_handle: contactHandle,
        nickname,
      }),
    });
  },

  async remove(contactId) {
    return apiRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Keys API
 */
export const keys = {
  async getPublicKey(handle) {
    return apiRequest(`/keys/${encodeURIComponent(handle)}`);
  },
};

/**
 * Node API
 */
export const node = {
  async getInfo() {
    return apiRequest('/node/info');
  },
};
