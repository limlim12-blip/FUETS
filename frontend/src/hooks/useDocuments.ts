import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocs, createDoc, deleteDoc } from '@/src/api/documents';

export const useDocuments = () => {
    return useQuery({
        queryKey: ['documents'],
        queryFn: fetchDocs,
    });
};
export const useCreateDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDoc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};


export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDoc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};

