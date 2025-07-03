import authApiRequest from "@/apiRequest/auth";
import { useMutation } from "@tanstack/react-query";

export const useAuthLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login,
  });
};
