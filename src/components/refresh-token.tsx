import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { checkAndRefreshToken } from "@/lib/utils";

const UNAUTHENTICATED_PATHS = ["/login", "/register", "/refresh-token"];

export default function RefreshToken() {
  const pathName = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathName)) return;
    let interval: any = null;
    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
      },
    });

    // Timeout interval phải bé hơn thời gian hết hạn của access token
    // Ví dụ thời gian hết hạn của access token là 10s thì 1s mình sẽ cho check 1 lần
    const TIMEOUT = 1000; // 1s
    interval = setInterval(checkAndRefreshToken, TIMEOUT);

    return () => clearInterval(interval);
  }, [pathName]);

  return null;
}
