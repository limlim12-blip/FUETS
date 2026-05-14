import { useCreateChatApiV1ChatsPost, useReadChatsApiV1ChatsGet, useDeleteChatApiV1ChatsIdDelete, getReadChatsApiV1ChatsGetQueryKey } from "./chats";
import { useQueryClient } from '@tanstack/react-query';



export const useChatActions = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useReadChatsApiV1ChatsGet({
        limit: 20,
        offset: 0
    });

    const createMutation = useCreateChatApiV1ChatsPost();
    const deleteMutation = useDeleteChatApiV1ChatsIdDelete();

    const handleCreate = async () => {
        return createMutation.mutateAsync({
            data: { title: "New Chat" }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['read_chats_api_v1_chats__get'] });
            }
        });
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutateAsync({ id }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey() });
            }
        });
    };

    return {
        handleCreate,
        handleDelete,
        conversations: data?.data ?? [],
        error: isError,
        isLoading,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
