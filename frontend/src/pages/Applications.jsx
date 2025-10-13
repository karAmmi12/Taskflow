import { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import ApplicationsFilterBar from '../components/Applications/ApplicationsFilterBar';
import ApplicationCard from '../components/Applications/ApplicationCard';
import ApplicationModal from '../components/Applications/ApplicationModal';
import ApplicationStats from '../components/Applications/ApplicationStats';
import useApplicationStore from '../store/applicationStore';

const Applications = () => {
  const {
    applications,
    stats,
    filters,
    loading,
    error,
    fetchApplications,
    fetchStats,
    createApplication,
    updateApplication,
    deleteApplication,
    setFilters,
    resetFilters,
    clearError,
  } = useApplicationStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  useEffect(() => {
    if (error) {
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleNewApplication = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleEditApplication = (application) => {
    setEditingApplication(application);
    setIsModalOpen(true);
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      const result = await deleteApplication(applicationId);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleModalSubmit = async (applicationData) => {
    let result;
    if (editingApplication) {
      result = await updateApplication(editingApplication.id, applicationData);
    } else {
      result = await createApplication(applicationData);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingApplication(null);
    } else {
      alert(result.error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // Grouper les candidatures par statut
  const applicationsByStatus = {
    applied: applications.filter((app) => app.status === 'applied'),
    interview: applications.filter((app) => app.status === 'interview'),
    rejected: applications.filter((app) => app.status === 'rejected'),
    accepted: applications.filter((app) => app.status === 'accepted'),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Gestion des Candidatures
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Suivez vos candidatures de stages et d'emploi
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <ApplicationStats stats={stats} />

        {/* Filter Bar */}
        <ApplicationsFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onNewApplication={handleNewApplication}
          stats={stats}
        />

        {/* Applications Grid */}
        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400 py-8">
            Chargement des candidatures...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Applied Applications */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                Candidatures envoyées ({applicationsByStatus.applied.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicationsByStatus.applied.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                ))}
                {applicationsByStatus.applied.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune candidature envoyée
                  </div>
                )}
              </div>
            </div>

            {/* Interview Applications */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                Entretiens ({applicationsByStatus.interview.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicationsByStatus.interview.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                ))}
                {applicationsByStatus.interview.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucun entretien programmé
                  </div>
                )}
              </div>
            </div>

            {/* Accepted Applications */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                Acceptées ({applicationsByStatus.accepted.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicationsByStatus.accepted.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                ))}
                {applicationsByStatus.accepted.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune candidature acceptée
                  </div>
                )}
              </div>
            </div>

            {/* Rejected Applications */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                Refusées ({applicationsByStatus.rejected.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicationsByStatus.rejected.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                ))}
                {applicationsByStatus.rejected.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune candidature refusée
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          application={editingApplication}
        />
      )}
    </div>
  );
};

export default Applications;