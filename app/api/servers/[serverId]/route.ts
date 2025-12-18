import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = params;
    const { name, imageUrl } = await req.json();

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!serverId)
      return new NextResponse("Server ID missing", { status: 400 });

    if (!name || !imageUrl)
      return new NextResponse("Name and image are required", {
        status: 400
      });

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: MemberRole.ADMIN
          }
        }
      }
    });

    if (!server)
      return new NextResponse("Forbidden", { status: 403 });

    const updatedServer = await db.server.update({
      where: { id: serverId },
      data: { name, imageUrl }
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[SERVER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = params;

    if (!profile)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!serverId)
      return new NextResponse("Server ID missing", { status: 400 });

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: MemberRole.ADMIN
          }
        }
      }
    });

    if (!server)
      return new NextResponse("Forbidden", { status: 403 });

    const deletedServer = await db.server.delete({
      where: { id: serverId }
    });

    return NextResponse.json(deletedServer);
  } catch (error) {
    console.error("[SERVER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
