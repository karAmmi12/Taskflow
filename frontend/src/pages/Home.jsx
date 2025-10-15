import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  KanbanSquare, 
  Briefcase, 
  Bell, 
  Search, 
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useApplicationStore from '../store/applicationStore';
import useJobAlertStore from '../store/jobAlertStore';

const Home = () => {
  const { user } = useAuthStore();
  const { stats: taskStats, fetchStats: fetchTaskStats } = useTaskStore();
  const { stats: appStats, fetchStats: fetchAppStats } = useApplicationStore();
  const { stats: alertStats, fetchStats: fetchAlertStats } = useJobAlertStore();

  useEffect(() => {
    // Charger les statistiques au montage
    fetchTaskStats();
    fetchAppStats();
    fetchAlertStats();
  }, [fetchTaskStats, fetchAppStats, fetchAlertStats]);

  const quickActions = [
    {
      title: 'Gérer mes tâches',
      description: 'Organisez votre travail avec le tableau Kanban',
      icon: KanbanSquare,
      path: '/dashboard',
      color: 'bg-blue-500',
      stats: `${taskStats.total} tâches`
    },
    {
      title: 'Candidatures',
      description: 'Suivez vos candidatures de stage et emploi',
      icon: Briefcase,
      path: '/applications',
      color: 'bg-green-500',
      stats: `${appStats.total} candidatures`
    },
    {
      title: 'Alertes emploi',
      description: 'Configurez vos alertes de recherche',
      icon: Bell,
      path: '/job-alerts',
      color: 'bg-purple-500',
      stats: `${alertStats.active} alertes actives`
    },
    {
      title: 'Offres trouvées',
      description: 'Consultez les opportunités détectées',
      icon: Search,
      path: '/job-offers',
      color: 'bg-orange-500',
      stats: `${alertStats.totalOffers} offres`
    }
  ];

  const recentActivity = [
    {
      icon: CheckCircle,
      text: `${taskStats.done} tâches terminées`,
      color: 'text-green-600'
    },
    {
      icon: Clock,
      text: `${taskStats.todo} tâches en attente`,
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      text: `${appStats.interview} entretiens programmés`,
      color: 'text-yellow-600'
    },
    {
      icon: Users,
      text: `${appStats.applied} candidatures envoyées`,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenue */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user?.name} ! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Votre espace personnel pour gérer vos tâches et recherches d'emploi
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {action.description}
                  </p>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {action.stats}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Résumé de l'activité */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Résumé de votre activité
            </h3>
            <div className="space-y-4">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              💡 Conseils pour bien commencer
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Organisez-vous :</strong> Créez vos premières tâches dans le tableau Kanban
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Cherchez un emploi :</strong> Configurez des alertes pour recevoir des offres
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>Suivez vos candidatures :</strong> Enregistrez vos demandes d'emploi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;