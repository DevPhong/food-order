import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequest/auth";

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

const isBrowser = typeof window !== "undefined";

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("accessToken") : null;

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("refreshToken") : null;

export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("accessToken", value);

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("refreshToken", value);

export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
  // Không nên đưa logic lấy accessToken và refreshToken ra khỏi function `checkRefreshToken` này
  // Vì để mỗi lần mà checkRefreshToken được gọi, thì lại lấy lại accessToken và refreshToken mới nhất
  // Tránh hiện tượng bug lấy accessToken và refreshToken cũ ở lần đầu rồi gọi cho các lần sau
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  // Chưa có đăng nhập thì không cần làm gì
  if (!accessToken || !refreshToken) return;

  const decodedAccessToken = jwt.decode(accessToken) as {
    exp: number;
    iat: number;
  };
  const decodedRefreshToken = jwt.decode(refreshToken) as {
    exp: number;
    iat: number;
  };

  // Thời điểm hết hạn của token thì tính theo epoch time(s)
  // Còn nếu dùng new Date().getTime() thì sẽ tính theo epoch time(ms)
  const now = Math.round(Date.now() / 1000); // Lấy thời gian hiện tại theo epoch time(s)

  // trường hợp refresh token đã hết hạn thì không cần làm gì
  if (decodedRefreshToken.exp <= now) return;

  // Ví dụ accessToken hết hạn trong 10s
  // thì mình sẽ kiểm tra còn 1/3 thời gian (3s) thì mình sẽ gọi API refresh token
  // thời gian còn lại mình tính theo : decodedAccessToken.exp - now
  // thời gian hết hạn của accessToken là decodedAccessToken.exp - decodedAccessToken.iat

  if (
    decodedAccessToken.exp - now <=
    (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    try {
      const res = await authApiRequest.refreshToken();
      // Lưu accessToken và refreshToken mới vào localStorage
      setAccessTokenToLocalStorage(res.payload.data.accessToken);
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};
