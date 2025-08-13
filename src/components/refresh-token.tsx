import jwt from "jsonwebtoken";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from "@/lib/utils";
import authApiRequest from "@/apiRequest/auth";

const UNAUTHENTICATED_PATHS = ["/login", "/register", "/refresh-token"];

export default function RefreshToken() {
  const pathName = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathName)) return;
    let interval: any = null;
    const checkAndRefreshToken = async () => {
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
        } catch (error) {
          clearInterval(interval);
        }
      }
    };
    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    checkAndRefreshToken();

    // Timeout interval phải bé hơn thời gian hết hạn của access token
    // Ví dụ thời gian hết hạn của access token là 10s thì 1s mình sẽ cho check 1 lần
    const TIMEOUT = 1000; // 1s
    interval = setInterval(checkAndRefreshToken, TIMEOUT);

    return () => clearInterval(interval);
  }, [pathName]);

  return null;
}
