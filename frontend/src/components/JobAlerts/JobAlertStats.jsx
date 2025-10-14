import { BarChart3, Bell, BellOff, TrendingUp } from 'lucide-react';

const JobAlertStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: BarChart3,
      color: 'bg-slate-500',
      textColor: 'text-slate-600 dark:text-slate-400'
    },
    {
      title: 'Alertes actives',
      value: stats.active,
      icon: Bell,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Alertes inactives',
      value: stats.inactive,
      icon: BellOff,
      color: 'bg-slate-400',
      textColor: 'text-slate-500 dark:text-slate-400'
    },
    {
      title: 'Taux d\'activation',
      value: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'bg-primary-500',
      textColor: 'text-primary-600 dark:text-primary-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JobAlertStats;