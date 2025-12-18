import { useEffect } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { Member, Message, Profile } from "@prisma/client";

import { useSocket } from "@/components/providers/socket-provider";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

type MessagePage = {
  items: MessageWithMemberWithProfile[];
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        [queryKey],
        (oldData) => {
          if (!oldData) return oldData;

          const pages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === message.id ? message : item
            )
          }));

          return {
            ...oldData,
            pages
          };
        }
      );
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        [queryKey],
        (oldData) => {
          if (!oldData || !oldData.pages?.length) {
            return {
              pageParams: oldData?.pageParams ?? [],
              pages: [
                {
                  items: [message]
                }
              ]
            };
          }

          const [firstPage, ...rest] = oldData.pages;
          const updatedFirstPage = {
            ...firstPage,
            items: [message, ...firstPage.items]
          };

          return {
            ...oldData,
            pages: [updatedFirstPage, ...rest]
          };
        }
      );
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
