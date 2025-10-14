import { create } from 'zustand';
import { jobAlertsApi, jobOffersApi } from '../services/api';

const useJobAlertStore = create((set, get) => ({
    jobAlerts: [],
    stats: { 
        active: 0, 
        inactive: 0, 
        total: 0
    },
    loading: false,
    error: null,
    filters: {
        active: null,
        search: ''
    },

    // Récupérer toutes les alertes
    fetchJobAlerts: async () => {
        set({ loading: true, error: null });
        try {
            const { filters } = get();
            const params = {};
            if (filters.active !== null) params.active = filters.active;
            if (filters.search) params.search = filters.search;

            const response = await jobAlertsApi.getJobAlerts(params);
            set({ jobAlerts: response.data.jobAlerts, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error || "Erreur lors de la récupération des alertes",
                loading: false
            });
        }
    },

    // Récupérer les statistiques
    fetchStats: async () => {
        try {
            const response = await jobAlertsApi.getStats();
            set({ stats: response.data.stats });
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques :", error);
        }
    },

    // Créer une nouvelle alerte
    createJobAlert: async (alertData) => {
        try {
            const response = await jobAlertsApi.createJobAlert(alertData);
            set((state) => ({
                jobAlerts: [response.data.jobAlert, ...state.jobAlerts]
            }));
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Erreur lors de la création de l'alerte"
            };
        }
    },

    // Mettre à jour une alerte
    updateJobAlert: async (id, alertData) => {
        try {
            const response = await jobAlertsApi.updateJobAlert(id, alertData);
            set((state) => ({
                jobAlerts: state.jobAlerts.map((alert) =>
                    alert.id === id ? response.data.jobAlert : alert
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

    // Supprimer une alerte
    deleteJobAlert: async (id) => {
        try {
            await jobAlertsApi.deleteJobAlert(id);
            set((state) => ({
                jobAlerts: state.jobAlerts.filter((alert) => alert.id !== id),
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


    // Traiter une alerte manuellement
    processAlert: async (alertId) => {
        try {
            const response = await jobOffersApi.processAlert(alertId);
            return { 
                success: true, 
                result: response.data.result 
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur lors du traitement'
            };
        }
    },

    // Mettre à jour les filtres
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
        get().fetchJobAlerts();
    },

    // Réinitialiser les filtres
    resetFilters: () => {
        set({ filters: { active: null, search: '' } });
        get().fetchJobAlerts();
    },

    // Effacer les erreurs
    clearError: () => set({ error: null }),
}));

export default useJobAlertStore;