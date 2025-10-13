import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Briefcase, GraduationCap } from 'lucide-react';

const ApplicationStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: BarChart3,
      color: 'bg-slate-500',
      textColor: 'text-slate-600 dark:text-slate-400'
    },
    {
      title: 'Candidatures envoyées',
      value: stats.applied,
      icon: Clock,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Entretiens',
      value: stats.interview,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Acceptées',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Refusées',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Stages',
      value: stats.stage,
      icon: GraduationCap,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Emplois',
      value: stats.emploi,
      icon: Briefcase,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className={`text-xs ${stat.textColor}`}>
                  {stat.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationStats;