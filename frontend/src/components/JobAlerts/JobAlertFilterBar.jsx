import { Search, Filter, RotateCcw, Plus, BarChart3 } from 'lucide-react';

const JobAlertFilterBar = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  onNewAlert, 
  stats 
}) => {
  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const handleStatusChange = (active) => {
    onFilterChange({ active });
  };

  const hasActiveFilters = filters.active !== null || filters.search !== '';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Rechercher une alerte..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              <button
                onClick={() => handleStatusChange(null)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  filters.active === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => handleStatusChange(true)}
                className={`px-4 py-2.5 text-sm font-medium border-l border-slate-200 dark:border-slate-600 transition-colors ${
                  filters.active === true
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                Actives
              </button>
              <button
                onClick={() => handleStatusChange(false)}
                className={`px-4 py-2.5 text-sm font-medium border-l border-slate-200 dark:border-slate-600 transition-colors ${
                  filters.active === false
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                Inactives
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        {/* Right: Stats & New Alert */}
        <div className="flex items-center space-x-3">
          {/* Stats */}
          <div className="hidden sm:flex items-center space-x-4 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Total: <strong className="text-slate-900 dark:text-white">{stats.total}</strong>
              </span>
            </div>
            
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Actives: <strong className="text-green-600 dark:text-green-400">{stats.active}</strong>
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Inactives: <strong className="text-slate-500">{stats.inactive}</strong>
              </span>
            </div>
          </div>

          {/* New Alert Button */}
          <button
            onClick={onNewAlert}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle alerte</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobAlertFilterBar;