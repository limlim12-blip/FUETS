import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCovs, createCov, deleteCov, Conversation } from '@/src/api/conversations';
export const useCovs = () => {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: fetchCovs,
    });
};
export const useCreateCov = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCov,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
};

export const useDeleteCov = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCov,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
};

