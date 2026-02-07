import { useQuery } from "@tanstack/react-query";
import { me } from "../utils/auth";

export function useAuth() {
  return useQuery({
    queryKey: ["me"],
    queryFn: me,
    retry: false,
  });
}
