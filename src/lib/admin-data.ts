import { cache } from "react";
import { headers } from "next/headers";
import { differenceInDays } from "date-fns";
import type {
  SessionWithImpersonatedBy,
  UserWithRole,
} from "better-auth/plugins/admin";

import { auth } from "./auth";
import { hasAdminRole, normalizeRoles } from "./admin-roles";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  roles: string[];
  banned: boolean;
  banReason: string | null;
  banExpiresAt: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  activeSessions: number;
  totalSessions: number;
};

export type SessionStatus = "ACTIVE" | "EXPIRED";

export type AdminSessionRow = {
  id: string;
  token: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  status: SessionStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type AdminOverview = {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  activeUsers: number;
  bannedUsers: number;
  recentSignups: number;
  averageSessionsPerUser: number;
};

type AdminDataset = {
  users: UserWithRole[];
  sessionsByUser: Map<string, SessionWithImpersonatedBy[]>;
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

const resolveAdminDataset = cache(async (): Promise<AdminDataset> => {
  const rawHeaders = await headers();
  const requestHeaders = Object.fromEntries(rawHeaders.entries());

  try {
    const { users } = await auth.api.listUsers({
      headers: requestHeaders,
      query: {
        limit: 1000,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    const sessionEntries = await Promise.all(
      users.map(async (user) => {
        try {
          const { sessions } = await auth.api.listUserSessions({
            headers: requestHeaders,
            body: { userId: user.id },
          });

          const sortedSessions = [...sessions].sort(
            (a, b) =>
              toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
          );

          return [user.id, sortedSessions] as const;
        } catch (error) {
          console.error(
            "Failed to load sessions for user",
            user.id,
            error
          );
          return [user.id, []] as const;
        }
      })
    );

    return {
      users,
      sessionsByUser: new Map(sessionEntries),
    };
  } catch (error) {
    console.error("Failed to load admin dataset", error);
    return {
      users: [],
      sessionsByUser: new Map(),
    };
  }
});

export async function getAdminUserRows(): Promise<AdminUserRow[]> {
  const { users, sessionsByUser } = await resolveAdminDataset();
  const now = new Date();

  return users.map((user) => {
    const userSessions = sessionsByUser.get(user.id) ?? [];
    const activeSessions = userSessions.filter(
      (session) => toDate(session.expiresAt) > now
    );
    const lastSession = userSessions[0] ?? null;
    const roles = normalizeRoles(user.role);
    const primaryRole = roles[0] ?? "user";

    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      image: user.image ?? null,
      role: primaryRole,
      roles,
      banned: Boolean(user.banned),
      banReason: user.banReason ?? null,
      banExpiresAt: user.banExpires
        ? toDate(user.banExpires).toISOString()
        : null,
      createdAt: toDate(user.createdAt).toISOString(),
      lastActiveAt: lastSession
        ? toDate(lastSession.createdAt).toISOString()
        : null,
      activeSessions: activeSessions.length,
      totalSessions: userSessions.length,
    };
  });
}

export async function getAdminSessionRows(): Promise<AdminSessionRow[]> {
  const { users, sessionsByUser } = await resolveAdminDataset();
  const userMap = new Map(users.map((user) => [user.id, user]));
  const now = new Date();

  const rows: AdminSessionRow[] = [];

  for (const [userId, sessions] of sessionsByUser.entries()) {
    const user = userMap.get(userId);

    for (const session of sessions) {
      const expiresAt = toDate(session.expiresAt);
      const createdAt = toDate(session.createdAt);
      const updatedAt = toDate(session.updatedAt);

      rows.push({
        id: session.id,
        token: session.token,
        userId: session.userId,
        userName: user?.name ?? "",
        userEmail: user?.email ?? "",
        userImage: user?.image ?? null,
        status: expiresAt > now ? "ACTIVE" : "EXPIRED",
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
    }
  }

  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { users, sessionsByUser } = await resolveAdminDataset();
  const now = new Date();

  const allSessions = Array.from(sessionsByUser.values()).flat();
  const activeSessions = allSessions.filter(
    (session) => toDate(session.expiresAt) > now
  );
  const totalSessions = allSessions.length;
  const expiredSessions = totalSessions - activeSessions.length;
  const activeUserIds = new Set(activeSessions.map((session) => session.userId));

  const totalUsers = users.length;
  const activeUsers = users.filter(
    (user) => !user.banned && activeUserIds.has(user.id)
  ).length;
  const bannedUsers = users.filter((user) => Boolean(user.banned)).length;
  const recentSignups = users.filter((user) => {
    const createdAt = toDate(user.createdAt);
    return differenceInDays(now, createdAt) <= 7;
  }).length;
  const averageSessionsPerUser =
    totalUsers === 0
      ? 0
      : Number((totalSessions / totalUsers).toFixed(2));

  const adminUsers = users.filter((user) => hasAdminRole(user.role)).length;
  const regularUsers = totalUsers - adminUsers;

  return {
    totalUsers,
    adminUsers,
    regularUsers,
    totalSessions,
    activeSessions: activeSessions.length,
    expiredSessions,
    activeUsers,
    bannedUsers,
    recentSignups,
    averageSessionsPerUser,
  };
}
