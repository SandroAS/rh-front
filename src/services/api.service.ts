import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL não está definida no .env. Por favor, configure-a.');
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.status === 403) {
        console.warn('Acesso negado (403). Verifique suas permissões.');
      }
      if (error.response.status === 401) {
        console.warn('Requisição não autorizada (401). Redirecionando para o login...');
        console.warn('Requisição não autorizada (401). Redirecionando para o login...');
        localStorage.removeItem('access_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
