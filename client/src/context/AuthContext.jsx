import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const isAdmin = token === 'admin-token';
      setUser({ isAdmin, token });
    }
    setLoading(false);
  }, []);

  const login = async (login, password) => {
    try {
      const response = await api.post('/login', { login, password });
      localStorage.setItem('token', response.data.token);
      setUser({ 
        isAdmin: response.data.isAdmin,
        token: response.data.token,
        userId: response.data.userId
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Ошибка авторизации' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}