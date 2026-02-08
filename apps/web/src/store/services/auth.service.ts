import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseService } from "./base.service";
import { AuthResponse, RegisterDto, LoginDto, User } from "../../types";
import { useAuthStore } from "../state/auth.store";
import { APP_ROUTES } from "../../data/route";
import { AUTH_ROUTES } from "./routes";

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterDto) =>
      baseService.post<AuthResponse>(AUTH_ROUTES.REGISTER, data),
    onSuccess: (response) => {
      baseService.saveToken(response.access_token);
      setAuth(response.user);
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["boardDetails"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginDto) =>
      baseService.post<AuthResponse>(AUTH_ROUTES.LOGIN, data),
    onSuccess: (response) => {
      baseService.saveToken(response.access_token);
      setAuth(response.user);
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["boardDetails"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => baseService.post(AUTH_ROUTES.LOGOUT),
    onSuccess: () => {
      console.log("Logged out successfully");
      baseService.removeToken();
      logout();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["boardDetails"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};
