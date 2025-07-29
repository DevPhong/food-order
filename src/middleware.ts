import { NextResponse, NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
const privatePaths = ["/manage"];
const unAuthPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Nếu chưa đăng nhập thì không cho private paths
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // Đăng nhập rồi thì không vào login
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Trường hợp đăng nhập rồi nhưng accessToken hết hạn
  if (
    privatePaths.some((path) => pathname.startsWith(path)) &&
    !accessToken &&
    refreshToken
  ) {
    const url = new URL("/logout", request.url);
    url.searchParams.set("refreshToken", refreshToken);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/manage/:path*", "/login"],
};
