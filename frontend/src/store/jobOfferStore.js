import { create } from 'zustand';
import { jobOffersApi } from '../services/api';

const useJobOfferStore = create((set, get) => ({
    offers: [],
    stats: { 
        total: 0,
        read: 0, 
        saved: 0, 
        applied: 0,
        recentOffers: 0,
        bySource: [],
        apiStatus: { adzuna: false, jobTome: false, total: 0 }
    },
    loading: false,
    error: null,
    filters: {
        source: null,
        isRead: null,
        isSaved: null,
        minScore: null,
        search: ''
    },

    // Récupérer toutes les offres
    fetchJobOffers: async () => {
        set({ loading: true, error: null });
        try {
            const { filters } = get();
            const params = {};
            
            if (filters.source) params.source = filters.source;
            if (filters.isRead !== null) params.isRead = filters.isRead;
            if (filters.isSaved !== null) params.isSaved = filters.isSaved;
            if (filters.minScore) params.minScore = filters.minScore;
            if (filters.search) params.search = filters.search;

            const response = await jobOffersApi.getJobOffers(params);
            set({ offers: response.data.offers, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error || "Erreur lors de la récupération des offres",
                loading: false
            });
        }
    },

    // Récupérer les statistiques
    fetchStats: async () => {
        try {
            const response = await jobOffersApi.getStats();
            set({ stats: response.data.stats });
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques :", error);
        }
    },

    // Mettre à jour le statut d'une offre
    updateOfferStatus: async (offerId, statusData) => {
        try {
            const response = await jobOffersApi.updateOfferStatus(offerId, statusData);
            set((state) => ({
                offers: state.offers.map((offer) =>
                    offer.id === offerId ? { ...offer, ...statusData } : offer
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

    // Supprimer une offre
    deleteOffer: async (offerId) => {
        try {
            await jobOffersApi.deleteOffer(offerId);
            set((state) => ({
                offers: state.offers.filter((offer) => offer.id !== offerId),
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
        get().fetchJobOffers();
    },

    // Réinitialiser les filtres
    resetFilters: () => {
        set({ filters: { source: null, isRead: null, isSaved: null, minScore: null, search: '' } });
        get().fetchJobOffers();
    },

    // Effacer les erreurs
    clearError: () => set({ error: null }),
}));

export default useJobOfferStore;