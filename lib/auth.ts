import { betterAuth } from "better-auth";
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
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: ["openid", "email", "profile"],
      async getUserInfo(token) {
        const profileEndpoint = "https://openidconnect.googleapis.com/v1/userinfo";

        if (token?.accessToken) {
          try {
            const response = await fetch(profileEndpoint, {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            });

            if (response.ok) {
              const profile = await response.json();
              const name =
                profile.name ||
                [profile.given_name, profile.family_name].filter(Boolean).join(" ") ||
                profile.email;

              return {
                user: {
                  id: profile.sub,
                  name,
                  email: profile.email,
                  image: profile.picture ?? null,
                  emailVerified: Boolean(profile.email_verified),
                },
                data: profile,
              };
            }
          } catch (error) {
            console.error("Failed to load Google profile", error);
          }
        }

        if (token?.idToken) {
          try {
            const [, payload] = token.idToken.split(".");
            if (!payload) {
              return null;
            }
            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
            const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, "=");
            const json = Buffer.from(padded, "base64").toString("utf8");
            const decoded = JSON.parse(json);
            const name =
              decoded.name ||
              [decoded.given_name, decoded.family_name].filter(Boolean).join(" ") ||
              decoded.email;

            return {
              user: {
                id: decoded.sub,
                name,
                email: decoded.email,
                image: decoded.picture ?? null,
                emailVerified: Boolean(decoded.email_verified),
              },
              data: decoded,
            };
          } catch (error) {
            console.error("Failed to decode Google id token", error);
          }
        }

        return null;
      },
      options: {
        overrideUserInfoOnSignIn: true,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
});
