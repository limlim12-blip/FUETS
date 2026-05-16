import { ChatUpdate } from "../model";
import { useCreateChatApiV1ChatsPost, useReadChatsApiV1ChatsGet, useDeleteChatApiV1ChatsIdDelete, getReadChatsApiV1ChatsGetQueryKey, useUpdateChatApiV1ChatsIdPut } from "./chats";
import { useQueryClient } from '@tanstack/react-query';



export const useChatActions = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useReadChatsApiV1ChatsGet({
        limit: 20,
        offset: 0
    });

    const createMutation = useCreateChatApiV1ChatsPost();
    const deleteMutation = useDeleteChatApiV1ChatsIdDelete();
    const updateMutation = useUpdateChatApiV1ChatsIdPut()

    const handleUpdate = async (id: string, { pinned, title }: { pinned?: boolean; title?: string } = {}) => {
        return updateMutation.mutateAsync({
            id: id,
            data: { pinned, title },
        }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey({ limit: 20, offset: 0 }) });
            }
        });
    };
    const handleCreate = async () => {
        return createMutation.mutateAsync({
            data: { title: "New Chat" }
        }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey({ limit: 20, offset: 0 }) });
            }
        });
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutateAsync({ id }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey({ limit: 20, offset: 0 }) });
            }
        });
    };

    return {
        handleCreate,
        handleDelete,
        handleUpdate,
        conversations: data?.data ?? [],
        error: isError,
        isLoading,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
};
