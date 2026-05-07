import { createContext, useContext, useMemo, useState } from 'react';
import { loginUser, signupUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('campusiq_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (payload) => {
    const nextUser = payload.user || payload.profile || { name: payload.name, email: payload.email };
    if (payload.token) localStorage.setItem('campusiq_token', payload.token);
    localStorage.setItem('campusiq_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const value = useMemo(() => ({
    user,
    async login(credentials) {
      const payload = await loginUser(credentials);
      persistSession(payload);
      return payload;
    },
    async signup(details) {
      const payload = await signupUser(details);
      persistSession(payload);
      return payload;
    },
    logout() {
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
