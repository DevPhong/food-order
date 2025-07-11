import authApiRequest from "@/apiRequest/auth";
import { cookies } from "next/headers";

export async function POST() {
  // Handle POST request
  const cookieStore = await cookies();

  // Lấy giá trị cookie
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  // Xóa cookie
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: "Không nhận được accessToken hoặc refreshToken",
      },
      {
        status: 200,
      }
    );
  }

  try {
    const result = await authApiRequest.sLogout({
      accessToken,
      refreshToken,
    });
    return Response.json(result.payload);
  } catch (error) {
    // Handle error from API
    return Response.json(
      { message: "Lỗi khi gọi API đến server backend" },
      { status: 200 }
    );
  }
}
