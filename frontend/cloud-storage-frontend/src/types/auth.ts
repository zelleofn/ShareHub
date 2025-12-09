import type { User } from './user';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<unknown>;
  logout: () => void;
  isAuthenticated: boolean;
}
