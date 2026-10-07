import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Clear the current authentication state.
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem(
      "campusconnect-access-token"
    );

    localStorage.removeItem(
      "campusconnect-auth"
    );

    setUser(null);
  }, []);

  /*
   * Ask the backend who the currently
   * authenticated user is.
   *
   * The JWT is automatically attached
   * by request.js.
   */
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(
      "campusconnect-access-token"
    );

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const data = await api.me();

      setUser(data.user);

      /*
       * This is only a UI cache.
       * The backend remains the source of truth.
       */
      localStorage.setItem(
        "campusconnect-auth",
        JSON.stringify(data.user)
      );

      return data.user;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  /*
   * Restore authentication when the application
   * starts or the browser is refreshed.
   */
  useEffect(() => {
    let active = true;

    async function restoreAuthentication() {
      try {
        const token = localStorage.getItem(
          "campusconnect-access-token"
        );

        if (!token) {
          if (active) {
            setUser(null);
          }

          return;
        }

        const data = await api.me();

        if (active) {
          setUser(data.user);

          localStorage.setItem(
            "campusconnect-auth",
            JSON.stringify(data.user)
          );
        }
      } catch {
        if (active) {
          clearAuth();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreAuthentication();

    return () => {
      active = false;
    };
  }, [clearAuth]);


  const hasPermission = useCallback(
    (permission) => {
      return Boolean(
        user?.permissions?.includes(permission)
      );
    },
    [user]
  );


  /*
   * Authenticate a user.
   */
  const login = useCallback(
    async (credentials) => {
      const data = await api.login(
        credentials
      );

      /*
       * Save the JWT returned by Flask.
       */
      localStorage.setItem(
        "campusconnect-access-token",
        data.access_token
      );

      /*
       * Store the authenticated user in
       * React state immediately.
       */
      setUser(data.user);

      /*
       * UI cache only.
       */
      localStorage.setItem(
        "campusconnect-auth",
        JSON.stringify(data.user)
      );

      return data;
    },
    []
  );

  /*
   * End the current browser session.
   */
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    permissions: user?.permissions || [],
    hasPermission,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}