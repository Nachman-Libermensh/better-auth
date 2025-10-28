import { APIError } from "better-auth";

type SessionCreateContext = {
  path: string;
  redirect: (url: string) => never;
  context: {
    baseURL: string;
    options: {
      onAPIError?: {
        errorURL?: string;
      };
    };
    internalAdapter: {
      findUserById: (
        userId: string
      ) => Promise<
        | (Record<string, unknown> & {
            status?: string | null;
            deletedAt?: Date | string | null;
          })
        | null
      >;
    };
  };
};

type SessionRecord = {
  userId: string;
};

const inactiveUserMessage =
  "החשבון שלך אינו פעיל כרגע. אנא פנה למנהל המערכת לקבלת עזרה.";

function createRedirectError(ctx: SessionCreateContext) {
  const redirectURI =
    ctx.context.options.onAPIError?.errorURL || `${ctx.context.baseURL}/error`;
  const errorDescription = encodeURIComponent(inactiveUserMessage);
  return ctx.redirect(
    `${redirectURI}?error=inactive&error_description=${errorDescription}`
  );
}

export function userStatusGuard() {
  return {
    id: "user-status-guard",
    init() {
      return {
        options: {
          databaseHooks: {
            session: {
              create: {
                async before(session: SessionRecord, ctx?: SessionCreateContext) {
                  if (!ctx) {
                    return;
                  }

                  const user = await ctx.context.internalAdapter.findUserById(
                    session.userId
                  );

                  const status = (user?.status ?? "ACTIVE") as string;
                  const deletedAt = user?.deletedAt;

                  if (status !== "ACTIVE" || deletedAt) {
                    if (
                      ctx.path.startsWith("/callback") ||
                      ctx.path.startsWith("/oauth2/callback")
                    ) {
                      throw createRedirectError(ctx);
                    }

                    throw new APIError("FORBIDDEN", {
                      code: "INACTIVE_USER",
                      message: inactiveUserMessage,
                    });
                  }
                },
              },
            },
          },
        },
      };
    },
  };
}
