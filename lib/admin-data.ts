import { differenceInDays } from "date-fns";

import { prisma } from "./prisma";
import type { Role, UserStatus } from "./prisma";

export type UserRole = Role;

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string | null;
  activeSessions: number;
  totalSessions: number;
  deletedAt: string | null;
  isDeleted: boolean;
};

export type SessionStatus = "ACTIVE" | "EXPIRED";

export type AdminSessionRow = {
  id: string;
  token: string;
  userId: string;
  userName: string;
  userEmail: string;
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
  inactiveUsers: number;
  recentSignups: number;
  averageSessionsPerUser: number;
};

export async function getAdminUserRows(): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    include: {
      sessions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  return users.map((user) => {
    const activeSessions = user.sessions.filter(
      (session) => session.expiresAt > now
    );
    const lastSession = user.sessions[0] ?? null;
    const status = ((user as unknown as { status?: UserStatus }).status ??
      "ACTIVE") as UserStatus;
    const deletedAt = (user as unknown as { deletedAt?: Date | null })
      .deletedAt;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role as UserRole,
      status,
      createdAt: user.createdAt.toISOString(),
      lastActiveAt: lastSession?.createdAt.toISOString() ?? null,
      activeSessions: activeSessions.length,
      totalSessions: user.sessions.length,
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
      isDeleted: Boolean(deletedAt),
    };
  });
}

export async function getAdminSessionRows(): Promise<AdminSessionRow[]> {
  const sessions = await prisma.session.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  return sessions.map((session) => {
    const status: SessionStatus =
      session.expiresAt > now ? "ACTIVE" : "EXPIRED";

    return {
      id: session.id,
      token: session.token,
      userId: session.userId,
      userName: session.user?.name ?? "",
      userEmail: session.user?.email ?? "",
      status,
      ipAddress: session.ipAddress ?? null,
      userAgent: session.userAgent ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    };
  });
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [users, sessions] = await Promise.all([
    prisma.user.findMany({
      include: {
        sessions: true,
      },
    }),
    prisma.session.findMany(),
  ]);

  const now = new Date();
  const activeSessions = sessions.filter(
    (session) => session.expiresAt > now
  );
  const expiredSessions = sessions.length - activeSessions.length;
  const activeUserIds = new Set(activeSessions.map((session) => session.userId));
  const nonDeletedUsers = users.filter((user) => {
    const deletedAt = (user as unknown as { deletedAt?: Date | null })
      .deletedAt;
    return !deletedAt;
  });
  const totalUsers = nonDeletedUsers.length;
  const activeUsers = nonDeletedUsers.filter((user) => {
    const status = ((user as unknown as { status?: UserStatus }).status ??
      "ACTIVE") as UserStatus;
    return status === "ACTIVE" && activeUserIds.has(user.id);
  }).length;
  const inactiveByStatus = nonDeletedUsers.filter((user) => {
    const status = ((user as unknown as { status?: UserStatus }).status ??
      "ACTIVE") as UserStatus;
    return status === "INACTIVE";
  }).length;
  const inactiveBySessions = nonDeletedUsers.filter((user) => {
    const status = ((user as unknown as { status?: UserStatus }).status ??
      "ACTIVE") as UserStatus;
    return status === "ACTIVE" && !activeUserIds.has(user.id);
  }).length;
  const inactiveUsers = inactiveByStatus + inactiveBySessions;
  const recentSignups = nonDeletedUsers.filter(
    (user) => differenceInDays(now, user.createdAt) <= 7
  ).length;
  const averageSessionsPerUser =
    totalUsers === 0 ? 0 : Number((sessions.length / totalUsers).toFixed(2));

  const adminUsers = nonDeletedUsers.filter(
    (user) => user.role === "ADMIN"
  ).length;
  const regularUsers = totalUsers - adminUsers;

  return {
    totalUsers,
    adminUsers,
    regularUsers,
    totalSessions: sessions.length,
    activeSessions: activeSessions.length,
    expiredSessions,
    activeUsers,
    inactiveUsers,
    recentSignups,
    averageSessionsPerUser,
  };
}
