/**
 * Authentication state store
 */
import { create } from 'zustand';
import { auth } from '../lib/api/client';
import {
  getPrivateKey,
  getSessionPassword,
  clearKeys,
  clearSessionPassword
} from '../lib/crypto/storage';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  privateKey: null,

  /**
   * Initialize auth state
   */
  initialize: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const user = await auth.getCurrentUser();

      // Try to retrieve private key using session password
      // getPrivateKey() already decrypts the key using the password
      const sessionPassword = getSessionPassword();
      let privateKey = null;

      if (sessionPassword) {
        try {
          console.log('Retrieving private key during initialization...');
          privateKey = await getPrivateKey(sessionPassword);
          console.log('✓ Private key retrieved during initialization');
        } catch (error) {
          console.error('Failed to retrieve private key during initialization:', error);
          // This is not fatal - user can restore keys later
        }
      }

      set({
        user,
        token,
        isAuthenticated: true,
        privateKey
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    }
  },

  /**
   * Login
   */
  login: async (username, password) => {
    set({ isLoading: true, error: null });

    try {
      const data = await auth.login(username, password);

      // Try to retrieve and decrypt private key
      // getPrivateKey() already decrypts the key using the password
      let privateKey = null;

      try {
        console.log('Retrieving private key from IndexedDB...');
        privateKey = await getPrivateKey(password);
        console.log('✓ Private key retrieved successfully');
      } catch (error) {
        console.error('Failed to retrieve private key:', error);
        // This is not fatal - user can restore keys later
      }

      set({
        user: {
          id: data.user_id,
          full_handle: data.full_handle,
          public_key_fingerprint: data.public_key_fingerprint
        },
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
        privateKey,
      });

      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('auth_token');
    clearSessionPassword();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      privateKey: null,
    });
  },

  /**
   * Register
   */
  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const data = await auth.register(
        userData.username,
        userData.password,
        userData.email,
        userData.publicKey,
        userData.fingerprint
      );

      set({
        user: {
          id: data.user_id,
          full_handle: data.full_handle,
          public_key_fingerprint: data.public_key_fingerprint
        },
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
        privateKey: userData.privateKey,
      });

      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },

  /**
   * Set private key
   */
  setPrivateKey: (privateKey) => {
    set({ privateKey });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));
