import { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import JobOfferCard from '../components/JobOffers/JobOfferCard';
import JobOfferFilterBar from '../components/JobOffers/JobOfferFilterBar';
import JobOfferStats from '../components/JobOffers/JobOfferStats';
import useJobOfferStore from '../store/jobOfferStore';

const JobOffers = () => {
  const {
    offers,
    stats,
    filters,
    loading,
    error,
    fetchJobOffers,
    fetchStats,
    updateOfferStatus,
    deleteOffer,
    setFilters,
    resetFilters,
    clearError,
  } = useJobOfferStore();

  useEffect(() => {
    fetchJobOffers();
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

  const handleUpdateStatus = async (offerId, statusData) => {
    const result = await updateOfferStatus(offerId, statusData);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      const result = await deleteOffer(offerId);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // Grouper les offres par statut de lecture
  const offersByStatus = {
    unread: offers.filter((offer) => !offer.isRead),
    read: offers.filter((offer) => offer.isRead && !offer.isSaved),
    saved: offers.filter((offer) => offer.isSaved),
    applied: offers.filter((offer) => offer.isApplied),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Offres d'Emploi
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Découvrez les opportunités trouvées par vos alertes
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <JobOfferStats stats={stats} />

        {/* Filter Bar */}
        <JobOfferFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          stats={stats}
        />

        {/* Offers Grid */}
        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-400 py-8">
            Chargement des offres...
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Vos alertes n'ont pas encore trouvé d'opportunités correspondantes.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Essayez de traiter manuellement vos alertes ou d'ajuster vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unread Offers */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                Nouvelles offres ({offersByStatus.unread.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offersByStatus.unread.map((offer) => (
                  <JobOfferCard
                    key={offer.id}
                    offer={offer}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteOffer}
                  />
                ))}
                {offersByStatus.unread.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune nouvelle offre
                  </div>
                )}
              </div>
            </div>

            {/* Saved Offers */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                Favoris ({offersByStatus.saved.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offersByStatus.saved.map((offer) => (
                  <JobOfferCard
                    key={offer.id}
                    offer={offer}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteOffer}
                  />
                ))}
                {offersByStatus.saved.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune offre sauvegardée
                  </div>
                )}
              </div>
            </div>

            {/* Applied Offers */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                Candidatures envoyées ({offersByStatus.applied.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offersByStatus.applied.map((offer) => (
                  <JobOfferCard
                    key={offer.id}
                    offer={offer}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteOffer}
                  />
                ))}
                {offersByStatus.applied.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune candidature envoyée
                  </div>
                )}
              </div>
            </div>

            {/* Other Read Offers */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div>
                Autres offres lues ({offersByStatus.read.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offersByStatus.read.map((offer) => (
                  <JobOfferCard
                    key={offer.id}
                    offer={offer}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteOffer}
                  />
                ))}
                {offersByStatus.read.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 dark:text-slate-500">
                    Aucune autre offre lue
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobOffers;