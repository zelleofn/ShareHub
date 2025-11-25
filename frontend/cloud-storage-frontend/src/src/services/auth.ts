import api from './axio';

const TOKEN_KEY = '/auth_token';

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {email, password});
    const token = response.data.token;
    saveToken(token);
    return token;
};

export const register = async (name: string, email: string, password: string) =>{
    const response = await api.post('/auth/register', {name, email, password});
    return response.data;
};

export const logout = () => {
    removeToken();
};

export const saveToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const refreshToken = async () => {
    const response = await api.post('/auth/refresh');
    const newToken = response.data.token;
    saveToken(newToken);
    return newToken;
};