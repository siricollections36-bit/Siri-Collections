import { createContext, useContext, useState, useEffect } from 'react';
// 1. REMOVED: import axios from 'axios';
// 2. ADDED: Import your custom api instance (Depth is one level up to src, then utils)
import api from '../utils/api'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      // 3. CHANGED: replaced axios.post('http://localhost:5000/api/auth/login'...)
      // with api.post('/auth/login'...)
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true, role: user.role };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  // SIGNUP FUNCTION
  const signup = async (name, email, password) => {
    try {
      // 4. CHANGED: replaced axios.post('http://localhost:5000/api/auth/signup'...)
      // with api.post('/auth/signup'...)
      const response = await api.post('/auth/signup', { 
        name, 
        email, 
        password 
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true, role: user.role };
    } catch (error) {
      console.error("Signup Context Error:", error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || "Signup failed. Please try again." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};