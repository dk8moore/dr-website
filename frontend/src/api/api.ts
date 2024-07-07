import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL as string,
});

export const signup = (userData: any) => 
    api.post('/signup/', userData);
export const login = (credentials: { email: string; password: string }) => 
    api.post('/login/', credentials);

export default api;