import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUserApiV1UserMeGet, useDeleteUserApiV1UserIdDelete, useUpdateUserApiV1UserIdPut, useCreateUserApiV1UserPost, getReadUsersApiV1UserGetQueryKey, useReadUsersApiV1UserGet } from "./user";
import { UsersPublic, UserCreate, UserUpdate } from "../model"

export const useUserActions = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useGetCurrentUserApiV1UserMeGet();
    const { data: users, refetch: usersFetch, isLoading: userLoading } = useReadUsersApiV1UserGet()

    const createMutation = useCreateUserApiV1UserPost();
    const deleteMutation = useDeleteUserApiV1UserIdDelete();
    const updateMutation = useUpdateUserApiV1UserIdPut()

    const handleUpdate = async (id: string, data: UserUpdate) => {
        return updateMutation.mutateAsync({ id: id, data: data });
    };
    const handleCreate = async (data: UserCreate) => {
        return createMutation.mutateAsync({
            data: data
        }, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadUsersApiV1UserGetQueryKey() });
            }
        });
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutateAsync({ id }, {
            onError: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadUsersApiV1UserGetQueryKey() });
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: getReadUsersApiV1UserGetQueryKey() });
            }
        });
    };

    return {
        data,
        users: users?.data,
        usersFetch,
        isError,
        handleCreate,
        handleDelete,
        handleUpdate,
        isLoading,
        userLoading,
        refetch,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
}
