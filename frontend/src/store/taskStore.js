import { create } from 'zustand';
import { tasksApi } from '../services/api';

const useTaskStore = create((set, get) => ({
    tasks: [],
    stats: { todo: 0, inProgress: 0, done: 0, total: 0},
    loading : false,
    error: null,
    filters: {
        status : null,
        priority : null,
        search: ''

    },

    //recuperer toutes les taches
    fetchTasks: async () => {
        set({ loading: true, error: null });
        try
        {
            const { filters } = get();
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;

            const response = await tasksApi.getTasks(params);
            set({ tasks: response.data.tasks, loading: false });

        }
        catch (error)
        {
            set({
                error: error.response?.data?.error || "Erreur lors de la récupération des tâches",
                loading: false
            });
        }
            
    },

    //recuperer les statistiques des taches
    fetchStats: async () => {
        try
        {
            const response = await tasksApi.getStats();
            set({ stats: response.data.stats });
        }
        catch (error)
        {
            console.error("Erreur lors de la récupération des statistiques des tâches :", error);
        }
    },

    //Créer une nouvelle tache
    createTask: async (taskData) => {
        try
        {
            const response = await tasksApi.createTask(taskData);
            set((state) => ({
                tasks: [...state.tasks, response.data]
            }));
            get().fetchStats();
            return { success: true };
        }
        catch (error)
        {
            return {
                success: false,
                error: error.response?.data?.error || "Erreur lors de la création de la tâche"
            };
        }
        
    },

    //Mettre à jour une tache
    updateTask: async (id, taskData) => {
        try 
        {
            const response = await tasksApi.updateTask(id, taskData);
            set((state) => ({
                tasks: state.tasks.map((task) =>
                task.id === id ? response.data.task : task
                ),
            }));
            get().fetchStats();
            return { success: true };
        } catch (error) 
        {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Erreur lors de la mise à jour' 
            };
        }
    },

    // Supprimer une tâche
    deleteTask: async (id) => {
        try 
        {
            await tasksApi.deleteTask(id);
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
            }));
            get().fetchStats();
            return { success: true };
        } 
        catch (error) 
        {
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
        get().fetchTasks();
    },

    // Réinitialiser les filtres
    resetFilters: () => {
        set({ filters: { status: null, priority: null, search: '' } });
        get().fetchTasks();
    },

    // Effacer les erreurs
    clearError: () => set({ error: null }),
}));

export default useTaskStore;