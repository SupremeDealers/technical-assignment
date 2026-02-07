/**
 * User returned from API
 */
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO string from backend
};

/**
 * Auth API Response
 */
export type AuthResponse = {
  user: User;
  token: string;
};

/**
 * Form Inputs
 */
export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

/**
 * Global Auth State (for Zustand/Context)
 */
export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
};
