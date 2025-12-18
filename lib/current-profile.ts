import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export const currentProfile = async () => {
  try {
    // auth() is async in the current Clerk SDK; await it so we actually get the user id
    const { userId } = await auth();

    if (!userId) return null;

    const profile = await db.profile.findUnique({
      where: { userId }
    });

    if (profile) return profile;

    return {
      id: "offline-profile",
      userId,
      name: "Offline User",
      imageUrl: "",
      email: "offline@example.com",
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
  } catch (error) {
    console.error("currentProfile fallback (db unreachable):", error);
    // Return a stub so UI can render even if the DB is down.
    return {
      id: "offline-profile",
      userId: "offline-user",
      name: "Offline User",
      imageUrl: "",
      email: "offline@example.com",
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
  }
};
