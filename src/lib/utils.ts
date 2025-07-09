import { EntityError } from "@/lib/http";
import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Xóa dấu gạch chéo đầu chuỗi
// Ví dụ: "/path/to/resource" -> "path/to/resource"
export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error && setError) {
    error?.errors.forEach((item: any) => {
      setError(item.field as any, { message: item.message });
    });
  } else {
    toast.error("Lỗi", {
      description: error?.payload?.message ?? "Lỗi không xác định",
      duration: duration ?? 5000,
    });
  }
};

export const getAccessTokenFromLocalStorage = () =>
  localStorage.getItem("accessToken");

export const getRefreshTokenFromLocalStorage = () =>
  localStorage.getItem("refreshToken");
