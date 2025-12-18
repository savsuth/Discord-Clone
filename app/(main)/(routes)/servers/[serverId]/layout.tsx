import React from "react";
import { notFound, redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ServerSidebar } from "@/components/server/server-sidebar";

export default async function ServerIdLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const profile = await currentProfile();

  // If the user is signed in but doesn't have a profile yet, send them through the setup flow
  if (!profile) return redirect("/");

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (!server) return notFound();

  return (
    <div className="h-full">
      <div className="flex h-full w-60 z-20 flex-col fixed inset-y-0 left-[72px]">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full pl-60">{children}</main>
    </div>
  );
}
