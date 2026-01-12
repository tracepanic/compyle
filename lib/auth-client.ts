import { auth } from "@/lib/auth";
import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const {
  signUp,
  signIn,
  useSession,
  getSession,
  listSessions,
  listAccounts,
  revokeSession,
  sendVerificationEmail,
  deleteUser,
  signOut,
  changeEmail,
  updateUser,
  linkSocial,
  unlinkAccount,
  changePassword,
  requestPasswordReset,
  isUsernameAvailable,
  resetPassword,
} = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!, // Look into this env, server client stuff
  plugins: [usernameClient(), inferAdditionalFields<typeof auth>()],
});
