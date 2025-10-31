'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  username: string;
  role?: 'user' | 'admin';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me', { withCredentials: true });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/auth/login', { username, password }, { withCredentials: true });
      const res = await api.get('/auth/me', { withCredentials: true });
      setUser(res.data.user);
      router.replace('/blog');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { username, password }, { withCredentials: true });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = !!user && user.role === 'admin';

  return { user, loading, login, register, logout, isAdmin };
};
