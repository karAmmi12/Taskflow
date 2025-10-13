import { Calendar, MapPin, Phone, Mail, ExternalLink, Edit2, Trash2, Briefcase, GraduationCap, Euro } from 'lucide-react';

const ApplicationCard = ({ application, onEdit, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColors = {
    applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    interview: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const statusLabels = {
    applied: 'Candidature envoyée',
    interview: 'Entretien',
    rejected: 'Refusée',
    accepted: 'Acceptée',
  };

  const typeIcons = {
    stage: GraduationCap,
    emploi: Briefcase,
  };

  const TypeIcon = typeIcons[application.type];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <TypeIcon className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {application.type}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
            {application.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {application.company}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(application)}
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(application.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status]}`}>
          {statusLabels[application.status]}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {/* Application Date */}
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Candidature: {formatDate(application.applicationDate)}</span>
        </div>

        {/* Interview Date */}
        {application.interviewDate && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-yellow-500" />
            <span>Entretien: {formatDate(application.interviewDate)}</span>
          </div>
        )}

        {/* Location */}
        {application.location && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            <span>{application.location}</span>
          </div>
        )}

        {/* Salary */}
        {application.salary && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Euro className="w-4 h-4" />
            <span>{application.salary}</span>
          </div>
        )}
      </div>

      {/* Contact & Links */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          {/* Name */}
          {application.contactName && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {application.contactName}
            </span>
          )}
          {/* Email */}
          {application.contactEmail && (
            <a
              href={`mailto:${application.contactEmail}`}
              className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="Envoyer un email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}

          {/* Phone */}
          {application.contactPhone && (
            <a
              href={`tel:${application.contactPhone}`}
              className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="Appeler"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          {/* Job URL */}
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="Voir l'offre"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Follow up date */}
        {application.followUpDate && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Relance: {formatDate(application.followUpDate)}
          </div>
        )}
      </div>

      {/* Notes */}
      {application.notes && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {application.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;