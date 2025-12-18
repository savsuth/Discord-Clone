import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const channelId = searchParams.get("channelId");
    const cursor = searchParams.get("cursor");

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!channelId)
      return new NextResponse("Channel ID Missing", { status: 400 });

    const channel = await db.channel.findUnique({
      where: { id: channelId },
      include: {
        server: {
          include: {
            members: true
          }
        }
      }
    });

    if (!channel)
      return new NextResponse("Channel not found", { status: 404 });

    const isMember = channel.server.members.some(
      (member) => member.profileId === profile.id
    );

    if (!isMember)
      return new NextResponse("Forbidden", { status: 403 });

    const messages = await db.message.findMany({
      take: MESSAGES_BATCH,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: { channelId },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const nextCursor =
      messages.length === MESSAGES_BATCH
        ? messages[messages.length - 1].id
        : null;

    return NextResponse.json({
      items: messages,
      nextCursor
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
