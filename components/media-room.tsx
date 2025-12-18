"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import "@livekit/components-styles";
import {
  Chat,
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks
} from "@livekit/components-react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Track } from "livekit-client";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export function MediaRoom({ chatId, video, audio }: MediaRoomProps) {
  const { user } = useUser();

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim();
  const identity = user?.id;
  const displayName =
    user?.fullName || user?.username || user?.firstName || user?.id || "You";

  const fetchToken = useCallback(async () => {
    if (!identity) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/livekit?room=${encodeURIComponent(chatId)}&username=${encodeURIComponent(identity)}`
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to get LiveKit token");
      }

      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      console.error(err);
      setToken(null);
      setError(
        "Unable to connect to LiveKit. Check camera permissions and LiveKit server config."
      );
    } finally {
      setIsLoading(false);
    }
  }, [chatId, identity]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleDisconnected = (reason?: { reason?: string }) => {
    setIsLoading(false);
    setToken(null);
    setError(
      reason?.reason ||
        "Disconnected from LiveKit. Click Retry to reconnect."
    );
  };

  if (!serverUrl) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-sm text-red-500">
          Missing NEXT_PUBLIC_LIVEKIT_URL environment variable.
        </p>
      </div>
    );
  }

  if (!token || isLoading || error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        {!error && isLoading && (
          <>
            <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Connecting to LiveKit...
            </p>
          </>
        )}
        {error && (
          <div className="flex flex-col items-center gap-2 px-4">
            <p className="text-xs text-rose-500 text-center">{error}</p>
            <button
              onClick={fetchToken}
              className="text-sm text-indigo-500 hover:underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={video}
      audio={audio}
      token={token}
      connect
      serverUrl={serverUrl}
      data-lk-theme="default"
      onDisconnected={handleDisconnected}
      onError={(roomError) => {
        console.error(roomError);
        setIsLoading(false);
        setToken(null);
        setError(roomError?.message || "LiveKit error");
      }}
    >
      <RoomAudioRenderer />
      <RoomContent
        audio={audio}
        video={video}
        roomName={chatId}
        displayName={displayName}
      />
    </LiveKitRoom>
  );
}

function RoomContent({
  audio,
  video,
  roomName,
  displayName
}: {
  audio: boolean;
  video: boolean;
  roomName: string;
  displayName: string;
}) {
  const tracks = useTracks(
    useMemo(
      () => [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false }
      ],
      []
    )
  );

  const participantCount = tracks.filter(
    (track: any) => track?.participant
  ).length;

  return (
    <div className="flex h-full flex-col gap-3 bg-gradient-to-br from-[#1e1f22] via-[#1a1b1f] to-[#101014] text-white rounded-xl border border-zinc-800/60 p-4 shadow-2xl">
      <div className="flex items-center justify-between rounded-lg bg-[#232428] px-4 py-3 border border-zinc-800/60">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            Video Room
          </span>
          <span className="text-lg font-semibold text-white">
            {roomName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <span className="rounded-full bg-zinc-800 px-3 py-1">
            {displayName}
          </span>
          <span className="rounded-full bg-indigo-600/20 text-indigo-200 px-3 py-1 border border-indigo-500/30">
            {participantCount || 1} online
          </span>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800/60 bg-[#0f1014]">
          <GridLayout tracks={tracks} className="h-full">
            <ParticipantTile />
          </GridLayout>
        </div>

        <div className="w-72 md:w-80 rounded-xl border border-zinc-800/60 bg-[#0f1014] flex flex-col">
          <div className="px-3 py-2 border-b border-zinc-800 text-sm text-zinc-300">
            Chat
          </div>
          <Chat className="w-full flex-1" />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-[#0f1014]/80 px-4 py-3">
        <ControlBar
          variation="verbose"
          controls={{
            microphone: audio,
            camera: video,
            screenShare: video,
            chat: true,
            leave: true
          }}
          className="justify-between gap-3"
        />
      </div>
    </div>
  );
}
