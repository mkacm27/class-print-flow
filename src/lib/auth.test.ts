import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { initializeDefaultUser, login, isAuthenticated, logout } from './auth';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

const sessionStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('Authentication Logic', () => {

  beforeEach(() => {
    // Clear storages before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('initializeDefaultUser', () => {
    it('should create a default user in localStorage if one does not exist', () => {
      initializeDefaultUser();
      const userJSON = localStorage.getItem('app_user');
      expect(userJSON).not.toBeNull();

      const user = JSON.parse(userJSON!);
      expect(user.username).toBe('admin');
      expect(bcrypt.compareSync('password', user.password)).toBe(true);
    });

    it('should not overwrite an existing user', () => {
      // Arrange: Create a custom user
      const customUser = { username: 'custom', password: 'custompassword' };
      localStorage.setItem('app_user', JSON.stringify(customUser));

      // Act
      initializeDefaultUser();

      // Assert
      const userJSON = localStorage.getItem('app_user');
      const user = JSON.parse(userJSON!);
      expect(user.username).toBe('custom');
      expect(user.password).toBe('custompassword');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      // Ensure a default user exists for login tests
      initializeDefaultUser();
    });

    it('should return true and set session for correct credentials', () => {
      const result = login('admin', 'password');
      expect(result).toBe(true);
      expect(sessionStorage.getItem('dashboard_access')).toBe('true');
    });

    it('should return false for incorrect password', () => {
      const result = login('admin', 'wrongpassword');
      expect(result).toBe(false);
      expect(sessionStorage.getItem('dashboard_access')).toBeNull();
    });

    it('should return false for incorrect username', () => {
      const result = login('notadmin', 'password');
      expect(result).toBe(false);
      expect(sessionStorage.getItem('dashboard_access')).toBeNull();
    });

    it('should return false if no user is in storage', () => {
        localStorage.clear();
        const result = login('admin', 'password');
        expect(result).toBe(false);
    });
  });

  describe('isAuthenticated and logout', () => {
    beforeEach(() => {
      // A user must exist for login to be possible
      initializeDefaultUser();
    });

    it('isAuthenticated should return false initially', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('isAuthenticated should return true after a successful login', () => {
      login('admin', 'password');
      expect(isAuthenticated()).toBe(true);
    });

    it('logout should clear the session and cause isAuthenticated to return false', () => {
      // Arrange: login first
      login('admin', 'password');
      expect(isAuthenticated()).toBe(true); // Pre-condition

      // Act
      logout();

      // Assert
      expect(isAuthenticated()).toBe(false);
      expect(sessionStorage.getItem('dashboard_access')).toBeNull();
    });
  });
});
