import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, createMessage, deleteMessage } from '@/src/api/messages';

export const useMessages = (convId: string | null) => {
    return useQuery({
        queryKey: ['messages', convId],
        queryFn: () => fetchMessages(convId!),
        enabled: !!convId,
    });
};

// 2. CREATE MESSAGE
export const useCreateMessages = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMessage,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.convId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMessage,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.convId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
};
