import axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({ baseURL: 'http://localhost:8000' });

export const customInstance = <T>(
    url: string,
    options?: AxiosRequestConfig & { body?: any }
): Promise<T> => {
    // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const access_detail =
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzk2MDE5NTYsInN1YiI6ImE4ZGZhNjJjLWU0NjktNGY0Yi1iZTY2LWE5YTIzNjlhN2I0ZCJ9.Z9359x9BMfgUzpB2VXKUudYdUCLWYzpD3nOu6_NkE5o",
        "token_type": "bearer"
    }
    const token = access_detail.access_token

    const requestData = options?.data ?? options?.body;

    return AXIOS_INSTANCE({
        ...options,
        url,
        data: requestData,
        headers: {
            ...options?.headers,
            Authorization: token ? `Bearer ${token}` : undefined,
        },
    }).then(({ data }) => data);
};
