import { useEffect, useState } from 'react';
import {
  getToken,
  saveToken,
  removeToken,
  login as loginService,
  register as registerService,
} from '../services/auth';
import { AuthContext } from './AuthContext';
import type { User } from '../types/user';
export { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          name: payload.name,
          username: payload.username,
          email: payload.email,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
        });
      } catch {
        removeToken();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const token = await loginService(email, password);
    saveToken(token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({
      id: payload.id,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    });
  };

 const register = async (name: string, username: string, email: string, password: string) => {
    return await registerService(name, username, email, password);
};

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
