import http from "@/lib/http";
import { LoginBodyType, LoginResType } from "@/schemaValidations/auth.schema";

const authApiRequest = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body), // server next side
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("api/auth/login", body, {
      baseUrl: "",
    }), // client side
};

export default authApiRequest;
