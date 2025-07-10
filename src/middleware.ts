import { NextResponse, NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
const privatePaths = ["/manage"];
const unAuthPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = Boolean(request.cookies.get("accessToken")?.value);

  // Nếu chưa đăng nhập thì sẽ redirect về login
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Đăng nhập rồi thì không vào login
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && isAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/manage/:path*", "/login"],
};
