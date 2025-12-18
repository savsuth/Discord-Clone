import { NextResponse } from "next/server";
import { ChannelType, MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { name, type } = await req.json();

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!serverId)
      return new NextResponse("Server ID missing", { status: 400 });

    if (!name || !type)
      return new NextResponse("Name and type are required", {
        status: 400
      });

    if (!Object.values(ChannelType).includes(type))
      return new NextResponse("Invalid channel type", { status: 400 });

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      include: {
        members: true
      }
    });

    if (!server)
      return new NextResponse("Forbidden", { status: 403 });

    const member = server.members.find(
      (m) => m.profileId === profile.id
    );

    const isModerator =
      member?.role === MemberRole.MODERATOR ||
      member?.role === MemberRole.ADMIN;

    if (!isModerator)
      return new NextResponse("Forbidden", { status: 403 });

    const channel = await db.channel.create({
      data: {
        name,
        type,
        profileId: profile.id,
        serverId
      }
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
