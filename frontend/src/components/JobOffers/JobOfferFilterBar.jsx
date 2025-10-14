import { Search, Filter, RotateCcw, BarChart3 } from 'lucide-react';

const JobOfferFilterBar = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  stats 
}) => {
  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const handleSourceChange = (e) => {
    onFilterChange({ source: e.target.value || null });
  };

  const handleReadChange = (e) => {
    const value = e.target.value;
    onFilterChange({ isRead: value === '' ? null : value === 'true' });
  };

  const hasActiveFilters = filters.source || filters.isRead !== null || filters.search !== '';

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
              placeholder="Rechercher une offre..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* Source Filter */}
          <select
            value={filters.source || ''}
            onChange={handleSourceChange}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
          >
            <option value="">Toutes sources</option>
            <option value="Adzuna">Adzuna</option>
            <option value="JobTome">JobTome</option>
          </select>

          {/* Read Status Filter */}
          <select
            value={filters.isRead === null ? '' : filters.isRead.toString()}
            onChange={handleReadChange}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
          >
            <option value="">Toutes</option>
            <option value="false">Non lues</option>
            <option value="true">Lues</option>
          </select>

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

        {/* Right: Stats */}
        <div className="flex items-center space-x-4 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Total: <strong className="text-slate-900 dark:text-white">{stats.total}</strong>
            </span>
          </div>
          
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              APIs: <strong className="text-green-600 dark:text-green-400">{stats.apiStatus.total}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOfferFilterBar;