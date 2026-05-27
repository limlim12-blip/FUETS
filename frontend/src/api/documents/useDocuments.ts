import { useQueryClient } from "@tanstack/react-query";
import {
    useReadDocumentsApiV1DocumentsGet,
    useCreateDocumentApiV1DocumentsPost,
    useUpdateDocumentApiV1DocumentsIdPut,
    useDeleteDocumentApiV1DocumentsIdDelete,
    getReadDocumentsApiV1DocumentsGetQueryKey
} from "./documents";
import type { BodyCreateDocumentApiV1DocumentsPost, DocumentCreate, DocumentUpdate, ReadDocumentsApiV1DocumentsGetParams } from "../model";

export const useDocumentActions = (params: ReadDocumentsApiV1DocumentsGetParams = { page: 1, page_size: 30, sort_by: "created_at" }) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch, isFetching } = useReadDocumentsApiV1DocumentsGet(params);

    const createMutation = useCreateDocumentApiV1DocumentsPost();
    const updateMutation = useUpdateDocumentApiV1DocumentsIdPut();
    const deleteMutation = useDeleteDocumentApiV1DocumentsIdDelete();

    const handleCreate = async (docData: BodyCreateDocumentApiV1DocumentsPost) => {
        return await createMutation.mutateAsync(
            { data: docData },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: getReadDocumentsApiV1DocumentsGetQueryKey()
                    });
                },
                onError: () => {
                    console.log(docData.item_in)
                }
            }
        );
    };

    const handleUpdate = async (id: string, docData: DocumentUpdate) => {
        return await updateMutation.mutateAsync(
            {
                id,
                data: docData
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: getReadDocumentsApiV1DocumentsGetQueryKey()
                    });
                }
            }
        );
    };

    const handleDelete = async (id: string) => {
        return await deleteMutation.mutateAsync(
            { id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: getReadDocumentsApiV1DocumentsGetQueryKey()
                    });
                }
            }
        );
    };

    return {
        documents: data?.data ?? [],
        totalPages: data?.total_pages ?? -1,
        totalCount: data?.count ?? 0,

        isLoading,
        isFetching,
        error: isError,

        handleCreate,
        handleUpdate,
        handleDelete,
        handleSync: refetch,

        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};
