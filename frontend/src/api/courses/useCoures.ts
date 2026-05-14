import { useQueryClient } from "@tanstack/react-query";
import { getReadCoursesApiV1CoursesGetQueryKey, useCreateCourseApiV1CoursesPost, useDeleteCourseApiV1CoursesIdDelete, useReadCoursesApiV1CoursesGet, useUpdateCourseApiV1CoursesIdPut } from "./courses";
import { CourseUpdate, CourseCreate } from "../model";

export const useCourseActions = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useReadCoursesApiV1CoursesGet({
        limit: 20,
        offset: 0
    });

    const createMutation = useCreateCourseApiV1CoursesPost();
    const updateMutation = useUpdateCourseApiV1CoursesIdPut();
    const deleteMutation = useDeleteCourseApiV1CoursesIdDelete();

    const handleCreate = async (data: CourseCreate) => {
        return createMutation.mutateAsync({
            data: data
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['read_chats_api_v1_chats__get'] });
            }
        });
    };
    const handleUpdate = async (id: string, courseData: CourseUpdate) => {
        return await updateMutation.mutateAsync({
            id,
            data: courseData
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: getReadCoursesApiV1CoursesGetQueryKey()
                });
            }
        });
    };
    const handleDelete = (id: string) => {
        deleteMutation.mutateAsync({ id }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getReadCoursesApiV1CoursesGetQueryKey() });
            }
        });
    };

    return {
        courses: data?.data ?? [],
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
