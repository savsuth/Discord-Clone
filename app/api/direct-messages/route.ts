import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const conversationId = searchParams.get("conversationId");
    const cursor = searchParams.get("cursor");

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!conversationId)
      return new NextResponse("Conversation ID Missing", {
        status: 400
      });

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        memberOne: true,
        memberTwo: true
      }
    });

    if (!conversation)
      return new NextResponse("Conversation not found", { status: 404 });

    const isParticipant =
      conversation.memberOne.profileId === profile.id ||
      conversation.memberTwo.profileId === profile.id;

    if (!isParticipant)
      return new NextResponse("Forbidden", { status: 403 });

    const messages = await db.directMessage.findMany({
      take: MESSAGES_BATCH,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: { conversationId },
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
    console.error("[DIRECT_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
