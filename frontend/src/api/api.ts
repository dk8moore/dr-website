import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL as string,
});

export const signup = async (userData: any) => {
    const response = await api.post('/signup/', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
};

export const login = async (credentials: { email: string; password: string }) => {
    const response = await api.post('/login/', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
};

export default api;