import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner"
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

    const loginMutation = useLoginAccessTokenApiV1LoginAccessTokenPost();
    const registerMutation = useRegisterUserApiV1SignupPost();

    const handleLogin = async (credentials: BodyLoginAccessTokenApiV1LoginAccessTokenPost) => {
        return await loginMutation.mutateAsync({
            data: credentials
        }, {
            onSuccess: (response) => {
                if (response && response.access_token) {
                    localStorage.setItem('token', response.access_token);
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
        }, {
            onSuccess: (response) => {
                return response;
            },
            onError: (error) => {
                return error
            },

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

