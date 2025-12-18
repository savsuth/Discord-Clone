import { Server as HttpServer } from "http";
import { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import { Channel, Member, Profile, Server } from "@prisma/client";
import { NextApiResponse } from "next";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
  channels?: Channel[];
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: NetSocket & {
    server: HttpServer & {
      io: IOServer;
    };
  };
};
