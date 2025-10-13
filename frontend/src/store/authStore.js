import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    //connexion
    login: async (credentials) => {
        set({ loading: true, error: null });
        try
        {
            const response = await authAPI.login(credentials);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };  
        }
        catch (error)
        {
            const errorMessage = error.response?.data?.error || 'Erreur de connexion';
            set({error: errorMessage, loading: false});
            return { success: false, error: errorMessage };
        }
    },

    //inscription
    register: async (userData) => {
        set({ loading: true, error: null});
        try
        {
            const response = await authAPI.register(userData);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        }
        catch (error)
        {
            const errorMessage = error.response?.data?.error || "erreur d'inscription";
            set({ error: errorMessage, loading: false });
            return { success: false, error: errorMessage };
        }

    },

    //deconnexion
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token : null,
            isAuthenticated: false
        });

    },

    //effacer les erreurs
    clearError: () => set({ error: null })
}));

export default useAuthStore;