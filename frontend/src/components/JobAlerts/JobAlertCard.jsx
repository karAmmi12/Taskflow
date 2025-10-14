import { Calendar, MapPin, Building2, Euro, Clock, Edit2, Trash2, Bell, BellOff, Play, Pause, Search } from 'lucide-react';
import { useState } from 'react';

const JobAlertCard = ({ alert, onEdit, onDelete, onProcessAlert }) => {
  const [isToggling, setIsToggling] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const frequencyLabels = {
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire'
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    setIsToggling(true);
    
    // Simuler un délai pour l'animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await onEdit({
      ...alert,
      active: !alert.active
    });
    
    setIsToggling(false);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all ${
      !alert.active ? 'opacity-60' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {alert.active ? (
              <Bell className="w-4 h-4 text-green-500" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
            <span className={`text-xs uppercase tracking-wide font-medium ${
              alert.active 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {alert.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
            {alert.title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Process Alert Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onProcessAlert && typeof onProcessAlert === 'function') {
                onProcessAlert(alert.id);
              } else {
                console.error('onProcessAlert function not provided');
              }
            }}
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Rechercher des offres maintenant"
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Toggle Active/Inactive */}
          <button
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`p-2 rounded-lg transition-colors ${
              alert.active 
                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' 
                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={alert.active ? 'Désactiver l\'alerte' : 'Activer l\'alerte'}
          >
            {isToggling ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : alert.active ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => onEdit(alert)}
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(alert.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* Keywords */}
        {alert.keywords && alert.keywords.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Mots-clés
            </p>
            <div className="flex flex-wrap gap-1">
              {alert.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location & Company */}
        <div className="grid grid-cols-1 gap-2">
          {alert.location && (
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>{alert.location}</span>
            </div>
          )}
          
          {alert.company && (
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4" />
              <span>{alert.company}</span>
            </div>
          )}

          {alert.salary && (
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Euro className="w-4 h-4" />
              <span>{alert.salary}</span>
            </div>
          )}
        </div>

        {/* Contract Type */}
        {alert.contract && (
          <div>
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-full">
              {alert.contract}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Fréquence: {frequencyLabels[alert.frequency]}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3 inline mr-1" />
            Dernière vérif: {formatDate(alert.lastCheck)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAlertCard;