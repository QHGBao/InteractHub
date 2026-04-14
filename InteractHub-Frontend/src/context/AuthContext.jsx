import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
  };

  const login = async (data) => {
    const result = await authApi.login(data);
    saveAuth(result);
  };

  const register = async (data) => {
    const result = await authApi.register(data);
    saveAuth(result);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải dùng trong AuthProvider');
  return context;
};