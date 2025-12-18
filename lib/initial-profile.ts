import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

export const initialProfile = async () => {
  try {
    const { userId } = await auth();

    if (!userId) return redirect("/sign-in");

    const user = await currentUser();

    if (!user) return redirect("/sign-in");

    const profile = await db.profile.findUnique({
      where: {
        userId: user.id
      }
    });

    if (profile) return profile;

    const name = user.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : user.id;

    const newProfile = await db.profile.create({
      data: {
        userId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress
      }
    });

    return newProfile;
  } catch (error) {
    console.error("initialProfile fallback (db unreachable):", error);
    // Fallback stub so UI can render while offline
    const fallbackUser = await currentUser();
    return {
      id: "offline-profile",
      userId: fallbackUser?.id ?? "offline-user",
      name: fallbackUser?.fullName ?? "Offline User",
      imageUrl: fallbackUser?.imageUrl ?? "",
      email:
        fallbackUser?.emailAddresses?.[0]?.emailAddress ??
        "offline@example.com",
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
  }
};
