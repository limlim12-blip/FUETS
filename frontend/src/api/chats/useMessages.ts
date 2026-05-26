import { useQueryClient } from '@tanstack/react-query';
import {
    useCreateMessageApiV1ChatsIdPost,
    useReadMessagesApiV1ChatsIdMessagesGetInfinite,
    getReadMessagesApiV1ChatsIdMessagesGetInfiniteQueryKey,
    getReadChatsApiV1ChatsGetQueryKey
} from "./chats";
import { MessageCreate, ReadMessagesApiV1ChatsIdMessagesGetParams } from "../model";

export const useMessageActions = (chatId: string, params: Partial<ReadMessagesApiV1ChatsIdMessagesGetParams> = {}) => {
    const queryClient = useQueryClient();
    const queryKey = getReadMessagesApiV1ChatsIdMessagesGetInfiniteQueryKey(chatId, { page_size: params?.page_size || 30 });

    const createMutation = useCreateMessageApiV1ChatsIdPost({
        mutation: {
            onMutate: async (variables) => {
                await queryClient.cancelQueries({ queryKey });
                const previousData = queryClient.getQueryData(queryKey);
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey() });

                await queryClient.invalidateQueries({ queryKey });

                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old?.pages?.length) return old;

                    const newPages = [...old.pages];
                    const optimisticMessage = {
                        ...variables.data,
                        id: `temp-${Date.now()}`,
                        role: "user",
                        created_at: new Date().toISOString(),
                        chat_id: chatId,
                    };

                    newPages[0] = {
                        ...newPages[0],
                        data: [optimisticMessage, ...newPages[0].data]
                    };

                    return { ...old, pages: newPages };
                });

                return { previousData };
            },
            onError: (_err, _variables, context: any) => {
                if (context?.previousData) {
                    queryClient.setQueryData(queryKey, context.previousData);
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey });
            }
        }
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useReadMessagesApiV1ChatsIdMessagesGetInfinite(
        chatId,
        { page_size: params?.page_size || 30 },
        {
            query: {
                enabled: !!chatId,
                initialPageParam: 1,
                getNextPageParam: (lastPage) => {
                    if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
                    return undefined;
                }
            }
        }
    );

    const messages = data?.pages
        ? [...data.pages].reverse().flatMap((page) => [...(page.data || [])].reverse())
        : [];

    return {
        messages,
        error: isError,
        isLoading,
        fetchOlderMessages: fetchNextPage,
        hasMoreHistory: hasNextPage,
        isLoadingHistory: isFetchingNextPage,
        isCreating: createMutation.isPending,
        handleCreate: async (messageData: MessageCreate) => {
            return await createMutation.mutateAsync({ id: chatId, data: messageData });
        }
    };
};
