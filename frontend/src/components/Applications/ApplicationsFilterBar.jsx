import { Search, Plus, BarChart3 } from 'lucide-react';

const ApplicationsFilterBar = ({ filters, onFilterChange, onReset, onNewApplication, stats }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Left: Search & Filters */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Rechercher une candidature..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({ status: e.target.value || null })
            }
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="applied">Candidature envoyée</option>
            <option value="interview">Entretien</option>
            <option value="rejected">Refusée</option>
            <option value="accepted">Acceptée</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) =>
              onFilterChange({ type: e.target.value || null })
            }
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
          >
            <option value="">Tous les types</option>
            <option value="stage">Stage</option>
            <option value="emploi">Emploi</option>
          </select>

          {/* Reset button */}
          {(filters.search || filters.status || filters.type) && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Right: Stats & New Application */}
        <div className="flex items-center space-x-3">
          {/* Stats */}
          <div className="hidden sm:flex items-center space-x-4 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Total: <strong className="text-slate-900 dark:text-white">{stats.total}</strong>
              </span>
            </div>
          </div>

          {/* New Application Button */}
          <button
            onClick={onNewApplication}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle candidature</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsFilterBar;