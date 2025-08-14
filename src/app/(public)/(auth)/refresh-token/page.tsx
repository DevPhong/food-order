"use client";

import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function RefreshTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenTokenFromUrl = searchParams.get("refreshToken");
  const redirectPathname = searchParams.get("redirect");

  useEffect(() => {
    if (
      refreshTokenTokenFromUrl &&
      refreshTokenTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      console.log("vao nghe.........");
      // Call your refresh token API here
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },
      });
    }
  }, [router, refreshTokenTokenFromUrl, redirectPathname]);

  return <div>Refresh Token Page.....</div>;
}
