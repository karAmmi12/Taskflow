import { create } from 'zustand';
import { applicationsApi } from '../services/api';

const useApplicationStore = create((set, get) => ({
    applications: [],
    stats: { 
        applied: 0, 
        interview: 0, 
        rejected: 0, 
        accepted: 0, 
        total: 0,
        stage: 0,
        emploi: 0 
    },
    loading: false,
    error: null,
    filters: {
        status: null,
        type: null,
        search: ''
    },

    // Récupérer toutes les candidatures
    fetchApplications: async () => {
        set({ loading: true, error: null });
        try {
            const { filters } = get();
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.type) params.type = filters.type;
            if (filters.search) params.search = filters.search;

            const response = await applicationsApi.getApplications(params);
            set({ applications: response.data.applications, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error || "Erreur lors de la récupération des candidatures",
                loading: false
            });
        }
    },

    // Récupérer les statistiques
    fetchStats: async () => {
        try {
            const response = await applicationsApi.getStats();
            set({ stats: response.data.stats });
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques :", error);
        }
    },

    // Créer une nouvelle candidature
    createApplication: async (applicationData) => {
        try {
            const response = await applicationsApi.createApplication(applicationData);
            set((state) => ({
                applications: [response.data.application, ...state.applications]
            }));
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Erreur lors de la création de la candidature"
            };
        }
    },

    // Mettre à jour une candidature
    updateApplication: async (id, applicationData) => {
        try {
            const response = await applicationsApi.updateApplication(id, applicationData);
            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === id ? response.data.application : app
                ),
            }));
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur lors de la mise à jour'
            };
        }
    },

    // Supprimer une candidature
    deleteApplication: async (id) => {
        try {
            await applicationsApi.deleteApplication(id);
            set((state) => ({
                applications: state.applications.filter((app) => app.id !== id),
            }));
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur lors de la suppression'
            };
        }
    },

    // Mettre à jour les filtres
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
        get().fetchApplications();
    },

    // Réinitialiser les filtres
    resetFilters: () => {
        set({ filters: { status: null, type: null, search: '' } });
        get().fetchApplications();
    },

    // Effacer les erreurs
    clearError: () => set({ error: null }),
}));

export default useApplicationStore;