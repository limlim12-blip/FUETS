import { useQueryClient } from "@tanstack/react-query";
import {
    useReadDocumentFilesApiV1DocumentsDocIdFilesGet,
    useCreateDocumentFileApiV1DocumentsDocIdFilesPost,
    useUpdateDocumentFileApiV1DocumentsFilesFileIdPut,
    useDeleteDocumentApiV1DocumentsFilesFileIdDelete,
    getReadDocumentFilesApiV1DocumentsDocIdFilesGetQueryKey
} from "./documents";
import type { BodyCreateDocumentFileApiV1DocumentsDocIdFilesPost, DocumentFileUpdate, ReadDocumentFilesApiV1DocumentsDocIdFilesGetParams } from "../model";

export const useDocumentFileActions = (doc_id?: string, params: ReadDocumentFilesApiV1DocumentsDocIdFilesGetParams = {}) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch, isFetching } = useReadDocumentFilesApiV1DocumentsDocIdFilesGet(doc_id, params);

    const createMutation = useCreateDocumentFileApiV1DocumentsDocIdFilesPost();
    const updateMutation = useUpdateDocumentFileApiV1DocumentsFilesFileIdPut();
    const deleteMutation = useDeleteDocumentApiV1DocumentsFilesFileIdDelete();

    const handleCreate = async (docId: string, data: BodyCreateDocumentFileApiV1DocumentsDocIdFilesPost) => {
        return await createMutation.mutateAsync(
            { docId: docId, data: data },
            {
                onSuccess: (response) => {
                    console.log(response)
                    queryClient.invalidateQueries({
                        queryKey: getReadDocumentFilesApiV1DocumentsDocIdFilesGetQueryKey(doc_id, params)
                    });
                }
            }
        );
    };

    const handleUpdate = async (id: string, docData: DocumentFileUpdate) => {
        return await updateMutation.mutateAsync(
            {
                fileId: id,
                data: docData
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: getReadDocumentFilesApiV1DocumentsDocIdFilesGetQueryKey(doc_id, params)
                    });
                }
            }
        );
    };

    const handleDelete = async (id: string) => {
        return await deleteMutation.mutateAsync(
            { fileId: id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: getReadDocumentFilesApiV1DocumentsDocIdFilesGetQueryKey(doc_id, params)
                    });
                }
            }
        );
    };

    return {
        files: data?.data ?? [],
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
