import { db } from "@/db";
import { accounts, sessions, verifications } from "@/db/schemas/auth";
import { users } from "@/db/schemas/user";
import { sendEmailVerificationEmail, sendPasswordResetEmail } from "@/emails";
import { env } from "@/env/server";
import { createId } from "@paralleldrive/cuid2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

const drizzleSchemas = {
  user: users,
  account: accounts,
  session: sessions,
  verification: verifications,
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: drizzleSchemas,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ url, email: user.email, name: user.name });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({
        url,
        email: user.email,
        name: user.name,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  account: { accountLinking: { enabled: true, allowDifferentEmails: true } },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.username && user.displayUsername) {
            return { data: { ...user, imageSource: "none" } };
          } else {
            const username = createId();
            return {
              data: {
                ...user,
                username,
                imageSource: "oauth",
                displayUsername: username,
              },
            };
          }
        },
      },
    },
  },
  user: {
    changeEmail: { enabled: true },
    deleteUser: { enabled: true },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      imageProviderFileId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      imageSource: {
        type: "string",
        required: false,
        defaultValue: "imagekit",
      },
      about: {
        type: "string",
        required: false,
        defaultValue:
          "Building with Compyle AI. Sharing ideas and learning from the community.",
        input: true,
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    username({
      minUsernameLength: 5,
      maxUsernameLength: 32,
      usernameValidator: (username) => {
        if (username === "admin") {
          return false;
        }

        const usernameRegex = /^[a-z0-9_]{5,32}$/;
        return usernameRegex.test(username);
      },
    }),
  ],
});
