import { useQueryClient } from '@tanstack/react-query';
import {
    useLoginAccessTokenApiV1LoginAccessTokenPost,
    useRegisterUserApiV1SignupPost,
} from "./login";
import {
    BodyLoginAccessTokenApiV1LoginAccessTokenPost,
    UserRegister,
} from "../model";

export const useAuthActions = () => {
    const queryClient = useQueryClient();

    // 1. Initialize Mutations
    const loginMutation = useLoginAccessTokenApiV1LoginAccessTokenPost();
    const registerMutation = useRegisterUserApiV1SignupPost();

    const handleLogin = async (credentials: BodyLoginAccessTokenApiV1LoginAccessTokenPost) => {
        return await loginMutation.mutateAsync({
            data: credentials
        }, {
            onSuccess: (response) => {
                if (response.status === 200) {
                    localStorage.setItem('token', response.data.access_token);
                }
            },
            onError: (error) => {
                console.error("Login failed!", error.detail);
            }
        });
    };

    const handleRegister = async (userData: UserRegister) => {
        return await registerMutation.mutateAsync({
            data: userData
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        queryClient.clear();
    };

    return {
        handleLogin,
        handleRegister,
        handleLogout,

        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,

        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};

