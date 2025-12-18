import { NextResponse } from "next/server";
import { ChannelType, MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { name, type } = await req.json();
    const { channelId } = params;

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!serverId || !channelId)
      return new NextResponse("Server ID or Channel ID missing", {
        status: 400
      });

    if (!name || !type)
      return new NextResponse("Name and type are required", {
        status: 400
      });

    if (!Object.values(ChannelType).includes(type))
      return new NextResponse("Invalid channel type", { status: 400 });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId
      }
    });

    if (!channel)
      return new NextResponse("Channel not found", { status: 404 });

    if (channel.name === "general")
      return new NextResponse("Cannot edit the general channel", {
        status: 400
      });

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

    const updatedChannel = await db.channel.update({
      where: { id: channelId },
      data: { name, type }
    });

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { channelId } = params;

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!serverId || !channelId)
      return new NextResponse("Server ID or Channel ID missing", {
        status: 400
      });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId
      }
    });

    if (!channel)
      return new NextResponse("Channel not found", { status: 404 });

    if (channel.name === "general")
      return new NextResponse("Cannot delete the general channel", {
        status: 400
      });

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

    const deletedChannel = await db.channel.delete({
      where: { id: channelId }
    });

    return NextResponse.json(deletedChannel);
  } catch (error) {
    console.error("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
