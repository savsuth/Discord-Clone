import { redirect } from "next/navigation";

import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/lib/db";

export default async function ServerPage({
  params
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const profile = await initialProfile();

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    },
    select: { id: true }
  });

  if (!server) return redirect("/");

  const initialChannel = await db.channel.findFirst({
    where: { serverId },
    orderBy: { createdAt: "asc" }
  });

  if (!initialChannel) return redirect("/");

  return redirect(
    `/servers/${server.id}/channels/${initialChannel.id}`
  );
}
