import { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import JobAlertCard from '../components/JobAlerts/JobAlertCard';
import JobAlertModal from '../components/JobAlerts/JobAlertModal';
import JobAlertFilterBar from '../components/JobAlerts/JobAlertFilterBar';
import JobAlertStats from '../components/JobAlerts/JobAlertStats';
import useJobAlertStore from '../store/jobAlertStore';

const JobAlerts = () => {
  const {
    jobAlerts,
    stats,
    filters,
    loading,
    error,
    fetchJobAlerts,
    fetchStats,
    createJobAlert,
    updateJobAlert,
    deleteJobAlert,
    processAlert,
    setFilters,
    resetFilters,
    clearError,
  } = useJobAlertStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [processingAlert, setProcessingAlert] = useState(null); // NOUVEAU - Pour tracking

  useEffect(() => {
    fetchJobAlerts();
    fetchStats();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleNewAlert = () => {
    setEditingAlert(null);
    setIsModalOpen(true);
  };

  const handleEditAlert = (alertItem) => {
    setEditingAlert(alertItem);
    setIsModalOpen(true);
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      const result = await deleteJobAlert(alertId);
      if (!result.success) {
        window.alert(result.error);
      }
    }
  };

  const handleProcessAlert = async (alertId) => {
    try {
      // Trouver l'alerte pour avoir son nom
      const alertItem = jobAlerts.find(a => a.id === alertId);
      const alertName = alertItem ? alertItem.title : 'cette alerte';
      
      // Marquer l'alerte comme en cours de traitement
      setProcessingAlert(alertId);
      
      console.log(`🔄 Traitement de l'alerte "${alertName}" en cours...`);
      
      const result = await processAlert(alertId);
      
      if (result.success) {
        const newOffersCount = result.result.newOffers || 0;
        const totalFound = result.result.totalFound || 0;
        
        // Notification de succès
        if (newOffersCount > 0) {
          const message = `✅ Traitement terminé !\n${newOffersCount} nouvelles offres trouvées sur ${totalFound} au total pour "${alertName}".`;
          window.alert(message);
          
          // Proposer de voir les offres
          const goToOffers = window.confirm('Voulez-vous voir les nouvelles offres trouvées ?');
          if (goToOffers) {
            window.location.href = '/job-offers';
          }
        } else {
          window.alert(`✅ Traitement terminé pour "${alertName}" !\nAucune nouvelle offre trouvée cette fois-ci (${totalFound} offres analysées).`);
        }
      } else {
        window.alert(`❌ Erreur lors du traitement de "${alertName}": ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur handleProcessAlert:', error);
      window.alert('❌ Une erreur inattendue s\'est produite lors du traitement de l\'alerte');
    } finally {
      // Arrêter l'indicateur de traitement
      setProcessingAlert(null);
    }
  };

  const handleModalSubmit = async (alertData) => {
    let result;
    if (editingAlert) {
      result = await updateJobAlert(editingAlert.id, alertData);
    } else {
      result = await createJobAlert(alertData);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingAlert(null);
    } else {
      window.alert(result.error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // Grouper les alertes par statut
  const alertsByStatus = {
    active: jobAlerts.filter((alertItem) => alertItem.active),
    inactive: jobAlerts.filter((alertItem) => !alertItem.active),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Alertes Emploi
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Recevez des notifications pour les opportunités qui vous intéressent
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Processing Alert */}
        {processingAlert && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              🔄 Traitement de l'alerte en cours... Veuillez patienter.
            </p>
          </div>
        )}

        {/* Stats */}
        <JobAlertStats stats={stats} />

        {/* Filter Bar */}
        <JobAlertFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onNewAlert={handleNewAlert}
          stats={stats}
        />

        {/* Alerts Grid */}
        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400 py-8">
            Chargement des alertes...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Alerts */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                Alertes actives ({alertsByStatus.active.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertsByStatus.active.map((alertItem) => (
                  <JobAlertCard
                    key={alertItem.id}
                    alert={alertItem}
                    onEdit={handleEditAlert}
                    onDelete={handleDeleteAlert}
                    onProcessAlert={handleProcessAlert}
                    isProcessing={processingAlert === alertItem.id} // NOUVEAU - Passer l'état de traitement
                  />
                ))}
                {alertsByStatus.active.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune alerte active
                  </div>
                )}
              </div>
            </div>

            {/* Inactive Alerts */}
            <div>
              <h2 className="text-lg font-semibent text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div>
                Alertes inactives ({alertsByStatus.inactive.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertsByStatus.inactive.map((alertItem) => (
                  <JobAlertCard
                    key={alertItem.id}
                    alert={alertItem}
                    onEdit={handleEditAlert}
                    onDelete={handleDeleteAlert}
                    onProcessAlert={handleProcessAlert}
                    isProcessing={processingAlert === alertItem.id}
                  />
                ))}
                {alertsByStatus.inactive.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune alerte inactive
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {isModalOpen && (
        <JobAlertModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          alert={editingAlert}
        />
      )}
    </div>
  );
};

export default JobAlerts;