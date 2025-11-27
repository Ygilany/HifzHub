/**
 * Secure token storage using Expo SecureStore
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authStorage = {
  /**
   * Store authentication token securely
   */
  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
      throw error;
    }
  },

  /**
   * Get stored authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  /**
   * Remove authentication token
   */
  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
      throw error;
    }
  },

  /**
   * Store user data
   */
  async setUser(user: StoredUser): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user:', error);
      throw error;
    }
  },

  /**
   * Get stored user data
   */
  async getUser(): Promise<StoredUser | null> {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  },

  /**
   * Remove user data
   */
  async removeUser(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Failed to remove user:', error);
      throw error;
    }
  },

  /**
   * Clear all auth data
   */
  async clearAll(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeUser()]);
  },
};
