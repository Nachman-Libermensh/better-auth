import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "./prisma";
import { userStatusGuard } from "./plugins/user-status-guard";
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
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (!newSession) {
        return;
      }

      const path = ctx.path;
      const isGoogleCallback =
        path.startsWith("/callback/google") ||
        path.startsWith("/oauth2/callback/google");

      if (!isGoogleCallback) {
        return;
      }

      const accounts = await ctx.context.internalAdapter.findAccountByUserId(
        newSession.user.id,
      );
      if (!accounts || accounts.length === 0) {
        return;
      }
      const googleAccount = accounts.find(
        (account) => account.providerId === "google",
      );

      if (!googleAccount) {
        return;
      }

      const extractPictureFromIdToken = (idToken?: string | null) => {
        if (!idToken) {
          return null;
        }

        const [, payload] = idToken.split(".");
        if (!payload) {
          return null;
        }

        try {
          const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
          const padded = normalized.padEnd(
            normalized.length + ((4 - (normalized.length % 4)) % 4),
            "=",
          );
          const decoded = JSON.parse(
            Buffer.from(padded, "base64").toString("utf-8"),
          );
          const picture = decoded?.picture ?? decoded?.pictureUrl;
          return typeof picture === "string" ? picture : null;
        } catch (error) {
          ctx.context.logger?.warn?.(
            "Failed to decode Google id token for profile image",
            error,
          );
          return null;
        }
      };

      let profileImage = extractPictureFromIdToken(googleAccount.idToken);

      if (!profileImage && googleAccount.accessToken) {
        try {
          const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${googleAccount.accessToken}`,
            },
          });

          if (response.ok) {
            const data = (await response.json()) as { picture?: unknown };
            if (typeof data.picture === "string") {
              profileImage = data.picture;
            }
          } else {
            ctx.context.logger?.warn?.(
              "Failed to load Google profile image",
              await response.text().catch(() => response.statusText),
            );
          }
        } catch (error) {
          ctx.context.logger?.warn?.(
            "Failed to fetch Google profile image",
            error,
          );
        }
      }

      if (!profileImage || profileImage === newSession.user.image) {
        return;
      }

      await ctx.context.internalAdapter.updateUser(
        newSession.user.id,
        {
          image: profileImage,
        },
        ctx,
      );

      newSession.user.image = profileImage;
    }),
  },
  plugins: [
    admin({
      adminRoles: ["ADMIN"],
      defaultRole: "USER",
    }),
    userStatusGuard(),
  ],
});
