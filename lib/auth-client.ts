import { createAuthClient } from "better-auth/react";

export const { signUp } = createAuthClient({
  baseURL: "http://localhost:3000",
});
