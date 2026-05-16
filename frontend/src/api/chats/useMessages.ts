import { useQueryClient } from '@tanstack/react-query';
import {
    useCreateMessageApiV1ChatsIdPost,
    useReadMessagesApiV1ChatsIdMessagesGet,
    getReadMessagesApiV1ChatsIdMessagesGetQueryKey
} from "./chats";
import { MessageCreate } from "../model";

export const useMessageActions = (chatId: string) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useReadMessagesApiV1ChatsIdMessagesGet(chatId, {
        skip: 0,
        limit: 20,
    });

    const createMutation = useCreateMessageApiV1ChatsIdPost();

    const handleCreate = async (chatId: string, messageData: MessageCreate) => {
        return await createMutation.mutateAsync({
            id: chatId,
            data: messageData
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: getReadMessagesApiV1ChatsIdMessagesGetQueryKey(chatId, {
                        skip: 0,
                        limit: 20,
                    })
                });
            }
        });
    };

    return {
        handleCreate,
        messages: data?.data ?? [],
        error: isError,
        isLoading,
        isCreating: createMutation.isPending,
    };
};
