import { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import CVGenerator from '../components/Documents/CVGenerator';
import CoverLetterGenerator from '../components/Documents/CoverLetterGenerator';
import ProfileForm from '../components/profile/ProfileForm';
import { FileText, Download, Trash2, Zap, CheckCircle, XCircle } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedJobOffer, setSelectedJobOffer] = useState(null);
  const [activeTab, setActiveTab] = useState('cv');

  useEffect(() => {
    fetchDocuments();
    fetchUserProfile();
  }, []);

  const fetchDocuments = async () => {
    try {
        const response = await fetch('/api/documents', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        });
        
        if (!response.ok) {
        if (response.status === 404) {
            console.log('⚠️ Route /api/documents non trouvée');
            return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
        console.log('⚠️ Réponse non-JSON reçue pour /api/documents');
        return;
        }
        
        const data = await response.json();
        setDocuments(data.documents || []);
    } catch (error) {
        console.error('Erreur chargement documents:', error);
        setDocuments([]);
    }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/profiles', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
            });
            
            if (!response.ok) {
            if (response.status === 404) {
                console.log('⚠️ Route /api/profiles non trouvée');
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
            console.log('⚠️ Réponse non-JSON reçue pour /api/profiles');
            return;
            }
            
            const data = await response.json();
            setUserProfile(data.profile);
        } catch (error) {
            console.error('Erreur chargement profil:', error);
            setUserProfile(null);
        }
    };

  const deleteDocument = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
        alert('✅ Document supprimé avec succès');
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const profileCompleteness = () => {
    if (!userProfile) return 0;
    const fields = ['phone', 'address', 'summary'];
    const completed = fields.filter(field => userProfile[field] && userProfile[field].trim()).length;
    const experiencesCount = userProfile.experiences?.length || 0;
    const skillsCount = userProfile.skills?.length || 0;
    
    return Math.round(((completed + (experiencesCount > 0 ? 1 : 0) + (skillsCount > 0 ? 1 : 0)) / 5) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Générateur de Documents Professionnels
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Créez des CV et lettres de motivation personnalisés avec vos données
          </p>
        </div>

        {/* Statut du système */}
        <div className="mb-6 p-4 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Système Opérationnel
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Templates LaTeX personnalisés avec LaTeX compilateur
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">100% GRATUIT</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('cv')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cv'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Générateur CV
              </button>
              <button
                onClick={() => setActiveTab('cover')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cover'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Lettre de motivation
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Mon Profil
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Mes documents ({documents.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'cv' && (
              <CVGenerator 
                userProfile={userProfile} 
                onDocumentGenerated={fetchDocuments}
              />
            )}
            
            {activeTab === 'cover' && (
              <CoverLetterGenerator 
                jobOffer={selectedJobOffer} 
                userProfile={userProfile}
                onDocumentGenerated={fetchDocuments}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileForm onProfileUpdate={fetchUserProfile} />
            )}
            
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Mes documents générés
                  </h3>
                  
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">
                        Aucun document généré pour le moment
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {doc.filename}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>{doc.type === 'cv' ? 'CV' : 'Lettre de motivation'}</span>
                                <span>•</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                                <span>•</span>
                                <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">
                                  GRATUIT
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`/api/documents/download/${doc.id}`, '_blank')}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile completeness */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Profil utilisateur
              </h3>
              
              {userProfile ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Complétude</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {profileCompleteness()}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompleteness()}%` }}
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Nom: {userProfile.user?.name}
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Email: {userProfile.user?.email}
                    </p>
                    <p className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        userProfile.experiences?.length ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      Expériences: {userProfile.experiences?.length || 0}
                    </p>
                    <p className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        userProfile.skills?.length ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      Compétences: {userProfile.skills?.length || 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chargement du profil...
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                💡 Conseils
              </h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p><strong>Profil complet :</strong> Plus votre profil est détaillé, meilleurs seront vos documents</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p><strong>100% Gratuit :</strong> Aucun coût, génération illimitée</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p><strong>Templates professionnels :</strong> Designs modernes et optimisés</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                📊 Statistiques
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">CV générés</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {documents.filter(d => d.type === 'cv').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Lettres générées</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {documents.filter(d => d.type === 'cover_letter').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total documents</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {documents.length}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Coût total</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      0.00€ ✨
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;