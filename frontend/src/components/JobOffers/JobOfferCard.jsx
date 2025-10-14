import { ExternalLink, Bookmark, BookmarkCheck, Eye, EyeOff, Send, Trash2, Calendar, MapPin, Building2, Star } from 'lucide-react';
import { useState } from 'react';

const JobOfferCard = ({ offer, onUpdateStatus, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getSourceColor = (source) => {
    const colors = {
      'Adzuna': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'JobTome': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[source] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const handleStatusUpdate = async (field, value) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(offer.id, { [field]: value });
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
    setIsUpdating(false);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all ${
      !offer.isRead ? 'border-l-4 border-l-blue-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getSourceColor(offer.source)}`}>
              {offer.source}
            </span>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getScoreColor(offer.matchScore)}`}>
              <Star className="w-3 h-3 mr-1" />
              {offer.matchScore}%
            </span>
            {!offer.isRead && (
              <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Nouveau
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
            {offer.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-1">{offer.company}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Alerte: {offer.alertTitle}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Toggle Read */}
          <button
            onClick={() => handleStatusUpdate('isRead', !offer.isRead)}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-colors ${
              offer.isRead 
                ? 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700' 
                : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            title={offer.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
          >
            {offer.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Toggle Saved */}
          <button
            onClick={() => handleStatusUpdate('isSaved', !offer.isSaved)}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-colors ${
              offer.isSaved 
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={offer.isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {offer.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Toggle Applied */}
          <button
            onClick={() => handleStatusUpdate('isApplied', !offer.isApplied)}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-colors ${
              offer.isApplied 
                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={offer.isApplied ? 'Candidature envoyée' : 'Marquer candidature envoyée'}
          >
            <Send className={`w-4 h-4 ${offer.isApplied ? 'fill-current' : ''}`} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(offer.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {/* Location & Salary */}
        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
          {offer.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{offer.location}</span>
            </div>
          )}
          {offer.salary && (
            <div className="flex items-center space-x-1">
              <Building2 className="w-4 h-4" />
              <span>{offer.salary}</span>
            </div>
          )}
        </div>

        {/* Contract & Date */}
        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
          {offer.contract && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">{offer.contract}</span>}
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Publié le {formatDate(offer.publishedAt)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {offer.description && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
            {offer.description.length > 200 
              ? `${offer.description.substring(0, 200)}...` 
              : offer.description
            }
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex space-x-2">
          {offer.isSaved && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Bookmark className="w-3 h-3 mr-1" />Favoris</span>}
          {offer.isApplied && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><Send className="w-3 h-3 mr-1" />Candidature envoyée</span>}
        </div>
        
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => !offer.isRead && handleStatusUpdate('isRead', true)}
          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          <span>Voir l'offre</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default JobOfferCard;