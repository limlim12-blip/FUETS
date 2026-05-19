import Axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export const AXIOS_INSTANCE = Axios.create({
    baseURL: "http://localhost:8000"
});

// Request interceptor for auth
AXIOS_INSTANCE.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor for error handling
AXIOS_INSTANCE.interceptors.response.use(

    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            const queryClient = useQueryClient();
            queryClient.clear();

        }
        return Promise.reject(error);
    },
);

export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    return AXIOS_INSTANCE({
        ...config,
        ...options,
    }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
