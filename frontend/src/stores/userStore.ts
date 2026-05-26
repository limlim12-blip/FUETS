import { useUserActions } from '../api/user/useUser'

type Role = 'student' | 'admin'


export const useUserStore = () => {
    const { data } = useUserActions();

    const role: Role = data?.is_superuser ? 'admin' : 'student';

    return { role };
};
