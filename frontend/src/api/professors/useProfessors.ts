import { useQueryClient } from "@tanstack/react-query";
import { getReadProfsApiV1ProfsGetQueryKey, useCreateProfApiV1ProfsPost, useDeleteProfApiV1ProfsIdDelete, useReadProfsApiV1ProfsGet, useUpdateProfApiV1ProfsIdPut } from "./professors";
import { ProfUpdate, ProfCreate, ReadProfsApiV1ProfsGetParams } from "../model";

export const useProfActions = (params?: ReadProfsApiV1ProfsGetParams) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useReadProfsApiV1ProfsGet(params);

    const createMutation = useCreateProfApiV1ProfsPost();
    const updateMutation = useUpdateProfApiV1ProfsIdPut();
    const deleteMutation = useDeleteProfApiV1ProfsIdDelete();

    const handleCreate = async (data: ProfCreate) => {
        return createMutation.mutateAsync({
            data: data
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['read_chats_api_v1_chats__get'] });
            }
        });
    };
    const handleUpdate = async (id: string, ProfData: ProfUpdate) => {
        return await updateMutation.mutateAsync({
            id,
            data: ProfData
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: getReadProfsApiV1ProfsGetQueryKey()
                });
            }
        });
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutateAsync({ id }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getReadProfsApiV1ProfsGetQueryKey() });
            }
        });
    };

    return {
        Profs: data?.data ?? [],
        isLoading,
        error: isError,

        handleCreate,
        handleUpdate,
        handleDelete,

        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };


}
