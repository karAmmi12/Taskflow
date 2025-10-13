
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/';


//instance axios avec configuration de base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});


//intercepteur pour ajouter le token d'authentification à chaque requête

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) 
        {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//intercepteur pour gerer les erreurs d'authentification
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);

    }
);

//Auth API
export const authAPI = {
    register: (data) => api.post('auth/register', data),
    login: (data) => api.post('auth/login', data),
    getProfile: () => api.get('auth/profile')
};

//Tasks API
export const tasksApi = {
    getTasks: (params) => api.get('/tasks', { params }),
    getTaskById: (id) => api.get(`/tasks/${id}`),
    createTask: (data) => api.post('tasks', data),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`tasks/${id}`),
    getStats: () => api.get('tasks/stats')
};

export default api;

