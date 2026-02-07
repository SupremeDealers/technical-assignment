import { useAuthStore } from "../store/auth.store";

//*  STATE
export const useUser = () => useAuthStore((s) => s.user);
export const useIsLoading = () => useAuthStore((s) => s.isLoading);
export const useError = () => useAuthStore((s) => s.error);
export const useIsAuthenticated = () => useAuthStore((s) => !!s.token);

//*ACTIONS
export const useLogin = () => useAuthStore((s) => s.login);
export const useRegister = () => useAuthStore((s) => s.register);
export const useLogout = () => useAuthStore((s) => s.logout);
export const useClearError = () => useAuthStore((s) => s.clearError);
