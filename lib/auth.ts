import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"],
        required: true,
        input: false,
        defaultValue: "USER",
      },
      status: {
        type: ["ACTIVE", "INACTIVE"],
        required: true,
        input: false,
        defaultValue: "ACTIVE",
      },
      deletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  plugins: [
    admin({
      adminRoles: ["ADMIN"],
      defaultRole: "USER",
    }),
  ],
});
