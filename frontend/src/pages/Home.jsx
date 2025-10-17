import { useEffect, useState } from 'react';
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
  Users,
  FileText,
  Bot,
  Zap,
  Target,
  Award,
  Calendar
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
  
  // États pour les nouvelles métriques
  const [documentsCount, setDocumentsCount] = useState(0);
  const [jobOffersCount, setJobOffersCount] = useState(0);
  const [aiStatus, setAiStatus] = useState({ enabled: false, provider: null });

  useEffect(() => {
    // Charger toutes les statistiques
    fetchTaskStats();
    fetchAppStats();
    fetchAlertStats();
    fetchDocumentsStats();
    fetchJobOffersStats();
    checkAIStatus();
  }, [fetchTaskStats, fetchAppStats, fetchAlertStats]);

  // Nouvelles fonctions pour récupérer les stats
  const fetchDocumentsStats = async () => {
    try {
      const response = await fetch('/api/documents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocumentsCount(data.documents?.length || 0);
      }
    } catch (error) {
      console.error('Erreur stats documents:', error);
    }
  };

  const fetchJobOffersStats = async () => {
    try {
      const response = await fetch('/api/job-offers/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobOffersCount(data.stats?.total || 0);
      }
    } catch (error) {
      console.error('Erreur stats offres:', error);
    }
  };

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/documents/test-ai', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAiStatus({
          enabled: data.success,
          provider: data.provider || 'Hugging Face'
        });
      }
    } catch (error) {
      console.error('Erreur vérification IA:', error);
    }
  };

  // Actions rapides mises à jour
  const quickActions = [
    {
      title: 'Tableau Kanban',
      description: 'Organisez vos tâches de recherche d\'emploi',
      icon: KanbanSquare,
      path: '/dashboard',
      color: 'bg-blue-500',
      stats: `${taskStats.total} tâches`,
      badge: taskStats.todo > 0 ? taskStats.todo : null
    },
    {
      title: 'Mes Candidatures',
      description: 'Suivez vos demandes d\'emploi et stages',
      icon: Briefcase,
      path: '/applications',
      color: 'bg-green-500',
      stats: `${appStats.total} candidatures`,
      badge: appStats.interview > 0 ? appStats.interview : null
    },
    {
      title: 'Alertes Emploi',
      description: 'Automatisez votre recherche d\'opportunités',
      icon: Bell,
      path: '/job-alerts',
      color: 'bg-purple-500',
      stats: `${alertStats.active} alertes actives`,
      badge: alertStats.active > 0 ? '●' : null
    },
    {
      title: 'Offres Trouvées',
      description: 'Consultez les opportunités détectées',
      icon: Search,
      path: '/job-offers',
      color: 'bg-orange-500',
      stats: `${jobOffersCount} offres`,
      badge: jobOffersCount > 0 ? 'Nouveau' : null
    },
    {
      title: 'Générateur Documents',
      description: 'Créez CV et lettres de motivation',
      icon: FileText,
      path: '/documents',
      color: 'bg-indigo-500',
      stats: `${documentsCount} documents`,
      badge: aiStatus.enabled ? 'IA' : null
    }
  ];

  // Activité récente enrichie
  const recentActivity = [
    {
      icon: CheckCircle,
      text: `${taskStats.done} tâches terminées`,
      color: 'text-green-600',
      subtext: 'Félicitations pour votre productivité !'
    },
    {
      icon: Clock,
      text: `${taskStats.todo} tâches en attente`,
      color: 'text-blue-600',
      subtext: taskStats.todo > 0 ? 'Restez organisé(e)' : 'Tout est à jour !'
    },
    {
      icon: TrendingUp,
      text: `${appStats.interview} entretiens programmés`,
      color: 'text-yellow-600',
      subtext: appStats.interview > 0 ? 'Préparez-vous bien !' : 'Continuez vos candidatures'
    },
    {
      icon: Users,
      text: `${appStats.applied} candidatures envoyées`,
      color: 'text-purple-600',
      subtext: 'Persévérance est la clé du succès'
    },
    {
      icon: Target,
      text: `${alertStats.active} alertes surveillent le marché`,
      color: 'text-indigo-600',
      subtext: 'Votre recherche automatisée travaille pour vous'
    },
    {
      icon: Bot,
      text: aiStatus.enabled ? 'IA disponible pour vos documents' : 'Templates LaTeX disponibles',
      color: aiStatus.enabled ? 'text-green-600' : 'text-gray-600',
      subtext: aiStatus.enabled ? `Utilise ${aiStatus.provider}` : 'Créez des documents professionnels'
    }
  ];

  // Conseils personnalisés
  const getPersonalizedTips = () => {
    const tips = [];
    
    if (taskStats.total === 0) {
      tips.push({
        icon: KanbanSquare,
        title: 'Commencez par organiser',
        text: 'Créez vos premières tâches pour structurer votre recherche d\'emploi',
        color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
      });
    }
    
    if (alertStats.active === 0) {
      tips.push({
        icon: Bell,
        title: 'Automatisez votre recherche',
        text: 'Configurez des alertes pour recevoir des offres correspondant à vos critères',
        color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
      });
    }
    
    if (appStats.total === 0) {
      tips.push({
        icon: Briefcase,
        title: 'Suivez vos candidatures',
        text: 'Enregistrez vos demandes pour un suivi efficace',
        color: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      });
    }
    
    if (documentsCount === 0) {
      tips.push({
        icon: FileText,
        title: 'Créez vos documents',
        text: aiStatus.enabled 
          ? 'Utilisez l\'IA pour générer des CV et lettres personnalisés'
          : 'Générez des documents professionnels avec nos templates',
        color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300'
      });
    }
    
    // Tips par défaut si tout est en ordre
    if (tips.length === 0) {
      tips.push(
        {
          icon: Award,
          title: 'Excellent travail !',
          text: 'Vous utilisez efficacement TaskFlow. Continuez ainsi !',
          color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
        },
        {
          icon: TrendingUp,
          title: 'Optimisez vos candidatures',
          text: 'Personnalisez vos lettres de motivation pour chaque offre',
          color: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
        }
      );
    }
    
    return tips.slice(0, 3); // Maximum 3 conseils
  };

  const personalizedTips = getPersonalizedTips();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenue amélioré */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Motif de fond décoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <div className="w-full h-full bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
            </div>
            
            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">
                Bienvenue, {user?.name} ! 👋
              </h1>
              <p className="text-primary-100 text-lg mb-4">
                Votre espace personnel pour gérer efficacement votre recherche d'emploi
              </p>
              
              {/* Indicateurs rapides */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">
                    {alertStats.active} alerte{alertStats.active > 1 ? 's' : ''} active{alertStats.active > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {appStats.interview} entretien{appStats.interview > 1 ? 's' : ''} à venir
                  </span>
                </div>
                {aiStatus.enabled && (
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">IA disponible</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:scale-105 relative"
                >
                  {/* Badge */}
                  {action.badge && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center">
                      {action.badge}
                    </div>
                  )}
                  
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

        {/* Activité et conseils */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Résumé de l'activité */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              📊 Résumé de votre activité
            </h3>
            <div className="space-y-4">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {item.text}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.subtext}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conseils personnalisés */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              💡 Conseils personnalisés
            </h3>
            <div className="space-y-3">
              {personalizedTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className={`p-4 rounded-lg ${tip.color}`}>
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          {tip.title}
                        </p>
                        <p className="text-xs mt-1 opacity-90">
                          {tip.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section état du système */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            🔧 État du système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800 dark:text-green-400">
                  Recherche d'emploi
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                APIs actives et fonctionnelles
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              aiStatus.enabled 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  aiStatus.enabled ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <span className={`font-medium ${
                  aiStatus.enabled 
                    ? 'text-blue-800 dark:text-blue-400'
                    : 'text-yellow-800 dark:text-yellow-400'
                }`}>
                  Intelligence Artificielle
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                aiStatus.enabled 
                  ? 'text-blue-700 dark:text-blue-500'
                  : 'text-yellow-700 dark:text-yellow-500'
              }`}>
                {aiStatus.enabled 
                  ? `${aiStatus.provider} disponible`
                  : 'Templates LaTeX disponibles'
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-800 dark:text-purple-400">
                  Documents
                </span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-500 mt-1">
                Génération LaTeX opérationnelle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;