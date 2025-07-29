import accountApiRequest from "@/apiRequest/account";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  let name = "";
  try {
    const user = await accountApiRequest.sMe(accessToken as string);
    name = user.payload.data.name;
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
  }
  return <div>Dashboard {name}</div>;
}
