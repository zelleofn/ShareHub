import type { User } from './user';

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<unknown>;
  logout: () => void;
  isAuthenticated: boolean;
};