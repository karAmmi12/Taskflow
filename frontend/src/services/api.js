
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';


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

//Applications API
export const applicationsApi = {
    getApplications: (params) => api.get('/applications', { params }),
    createApplication: (data) => api.post('/applications', data),
    updateApplication: (id, data) => api.put(`/applications/${id}`, data),
    deleteApplication: (id) => api.delete(`/applications/${id}`),
    getStats: () => api.get('/applications/stats')
};

//Job Alerts API
export const jobAlertsApi = {
    getJobAlerts: (params) => api.get('/job-alerts', { params }),
    createJobAlert: (data) => api.post('/job-alerts', data),
    updateJobAlert: (id, data) => api.put(`/job-alerts/${id}`, data),
    deleteJobAlert: (id) => api.delete(`/job-alerts/${id}`),
    getStats: () => api.get('/job-alerts/stats')
};

//Job Offers API
export const jobOffersApi = {
    getJobOffers: (params) => api.get('/job-offers', { params }),
    updateOfferStatus: (id, data) => api.put(`/job-offers/${id}/status`, data),
    processAlert: (alertId) => api.post(`/job-offers/process/${alertId}`),
    getStats: () => api.get('/job-offers/stats'),
    deleteOffer: (id) => api.delete(`/job-offers/${id}`)
};

export default api;

