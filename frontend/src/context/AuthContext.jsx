import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const data = await fetchApi('/auth/me');
          setUser(data);
        } catch (err) {
          console.error('Invalid token, logging out...');
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);