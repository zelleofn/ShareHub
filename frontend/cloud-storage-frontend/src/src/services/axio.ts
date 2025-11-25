import axios from 'axios';

const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        withCredentials: true,
});

api.interceptors.request.use((config) => {
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
    console.error('API Error', error.respose?.data || error.message);
    return Promise.reject(error);
    }
);

export default api;