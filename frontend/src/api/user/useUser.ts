import { useGetCurrentUserApiV1UserMeGet } from "./user";

export const useUserActions = () => {
    const { data, isError, error } = useGetCurrentUserApiV1UserMeGet()

    return {
        data, isError, error
    };


}
