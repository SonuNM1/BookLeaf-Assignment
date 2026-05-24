import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, Author, AuthContextType } from '../types/index.js';
import api from '../services/api.js';
import { connectSocket, disconnectSocket } from '../socket/index.js';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    
  const [user, setUser] = useState<User | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const { user: userData, author: authorData } = res.data.data;

        setUser(userData);
        setAuthor(authorData);
        setToken(storedToken);
        connectSocket(userData.role, userData.author_id);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []); 

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post('/auth/login', { email, password });
    const {
      token: newToken,
      user: userData,
      author: authorData,
    } = res.data.data;
    localStorage.setItem('token', newToken);

    setToken(newToken);
    setUser(userData);
    setAuthor(authorData);
    connectSocket(userData.role, userData.author_id);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthor(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{ user, author, token, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};