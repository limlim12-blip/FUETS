import axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({ baseURL: 'YOUR_API_URL' });

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
    const token = localStorage.getItem('token');

    return AXIOS_INSTANCE({
        ...config,
        headers: {
            ...config.headers,
            Authorization: token ? `Bearer ${token}` : undefined,
        },
    }).then(({ data }) => data);
};
