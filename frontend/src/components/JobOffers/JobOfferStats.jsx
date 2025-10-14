import { BarChart3, Eye, Bookmark, Send, TrendingUp } from 'lucide-react';

const JobOfferStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: BarChart3,
      color: 'bg-slate-500',
      textColor: 'text-slate-600 dark:text-slate-400'
    },
    {
      title: 'Offres lues',
      value: stats.read,
      icon: Eye,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Favoris',
      value: stats.saved,
      icon: Bookmark,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Candidatures',
      value: stats.applied,
      icon: Send,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
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

export default JobOfferStats;