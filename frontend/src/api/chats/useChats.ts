import { useCreateChatApiV1ChatsPost, useReadChatsApiV1ChatsGet, useDeleteChatApiV1ChatsIdDelete, getReadChatsApiV1ChatsGetQueryKey, useUpdateChatApiV1ChatsIdPut } from "./chats";
import { useQueryClient } from '@tanstack/react-query';
import type { ReadChatsApiV1ChatsGetParams } from "../model";


export const useChatActions = (params?: ReadChatsApiV1ChatsGetParams) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useReadChatsApiV1ChatsGet(params);

    const createMutation = useCreateChatApiV1ChatsPost();
    const deleteMutation = useDeleteChatApiV1ChatsIdDelete();
    const updateMutation = useUpdateChatApiV1ChatsIdPut()

    const handleUpdate = async (id: string, { pinned, title }: { pinned?: boolean; title?: string } = {}) => {
        console.log("SENDING TO BACKEND:", { pinned, title });
        return updateMutation.mutateAsync({
            id: id,
            data: { pinned, title },
        }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey(params) });
            }
        });
    };
    const handleCreate = async () => {
        return createMutation.mutateAsync({
            data: { title: "New Chat" }
        }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey(params) });
            }
        });
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutateAsync({ id }, {
            onError: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey(params) });
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadChatsApiV1ChatsGetQueryKey(params) });
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
