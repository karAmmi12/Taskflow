import { useState, useEffect } from 'react';
import { Mail, Wand2, Loader2, AlertCircle, Sparkles, Search, CheckCircle, ExternalLink, Bot } from 'lucide-react';

const CoverLetterGenerator = ({ userProfile, onDocumentGenerated, aiEnabled }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobOffers, setJobOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  // État pour saisie manuelle
  const [manualJobOffer, setManualJobOffer] = useState({
    title: '',
    company: '',
    location: ''
  });
  
  const [options, setOptions] = useState({
    tone: 'professionnel',
    useAI: true // Activé par défaut
  });

  const tones = [
    { 
      id: 'professionnel', 
      label: 'Professionnel',
      description: 'Ton courtois et équilibré'
    },
    { 
      id: 'dynamique', 
      label: 'Dynamique',
      description: 'Énergique et enthousiaste'
    },
    { 
      id: 'créatif', 
      label: 'Créatif',
      description: 'Original et innovant'
    },
    { 
      id: 'formel', 
      label: 'Formel',
      description: 'Très traditionnel et sobre'
    }
  ];

  // Charger les offres d'emploi
  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    setLoadingOffers(true);
    try {
      const response = await fetch('/api/job-offers?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer);
    setManualMode(false);
  };

  const handleManualJobOfferChange = (field, value) => {
    setManualJobOffer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    const jobOffer = manualMode ? manualJobOffer : selectedOffer;
    
    if (!jobOffer || !jobOffer.title?.trim() || !jobOffer.company?.trim()) {
      alert('❌ Veuillez sélectionner une offre ou remplir les informations manuellement');
      return;
    }

    if (!userProfile) {
      alert('❌ Profil utilisateur requis');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/documents/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobOffer: {
            title: jobOffer.title.trim(),
            company: jobOffer.company.trim(),
            location: jobOffer.location?.trim() || 'Non spécifié'
          },
          options
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        window.open(data.document.downloadUrl, '_blank');
        
        const method = data.document.aiGenerated ? 'avec IA Hugging Face' : 'avec template LaTeX';
        alert(`✅ Lettre générée avec succès ${method} !`);
        
        // Réinitialiser
        setSelectedOffer(null);
        setManualJobOffer({ title: '', company: '', location: '' });
        
        if (onDocumentGenerated) {
          onDocumentGenerated();
        }
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('❌ Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSelectedJobOffer = () => {
    return manualMode ? manualJobOffer : selectedOffer;
  };

  const isFormValid = () => {
    const jobOffer = getSelectedJobOffer();
    return jobOffer && jobOffer.title?.trim() && jobOffer.company?.trim() && userProfile;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Générateur de Lettre de Motivation
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
            <span>Powered by Hugging Face IA</span>
            <Bot className="w-4 h-4 text-blue-500" />
          </p>
        </div>
      </div>

      {/* Status IA */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
              {options.useAI ? '🤖 Mode IA Hugging Face' : '📝 Mode Template LaTeX'}
            </span>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium rounded-full">
            ✨ 100% GRATUIT
          </span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
          {options.useAI 
            ? 'L\'IA personnalise votre lettre selon votre profil et l\'offre d\'emploi'
            : 'Template professionnel personnalisé avec vos informations'
          }
        </p>
      </div>

      {/* Mode de saisie */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setManualMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !manualMode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            📋 Mes offres ({jobOffers.length})
          </button>
          <button
            onClick={() => setManualMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              manualMode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            ✏️ Saisie manuelle
          </button>
        </div>
      </div>

      {/* Sélection d'offres */}
      {!manualMode && (
        <div className="mb-6">
          <h3 className="font-medium text-slate-900 dark:text-white mb-4">
            Sélectionner une offre d'emploi
          </h3>
          
          {loadingOffers ? (
            <div className="text-center py-4 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Chargement des offres...
            </div>
          ) : jobOffers.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucune offre disponible
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Créez des alertes emploi pour recevoir des offres
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {jobOffers.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => handleOfferSelect(offer)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                    selectedOffer?.id === offer.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                        {offer.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {offer.company}
                      </p>
                      {offer.location && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          📍 {offer.location}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                          {offer.source}
                        </span>
                        {offer.matchScore && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                            Match: {offer.matchScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      {selectedOffer?.id === offer.id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {offer.url && (
                        <a
                          href={offer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-slate-400 hover:text-blue-500"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saisie manuelle */}
      {manualMode && (
        <div className="mb-6 space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-white">
            Informations sur l'offre d'emploi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Titre du poste *
              </label>
              <input
                type="text"
                value={manualJobOffer.title}
                onChange={(e) => handleManualJobOfferChange('title', e.target.value)}
                placeholder="Ex: Développeur Full Stack"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Entreprise *
              </label>
              <input
                type="text"
                value={manualJobOffer.company}
                onChange={(e) => handleManualJobOfferChange('company', e.target.value)}
                placeholder="Ex: Google France"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Localisation (optionnel)
            </label>
            <input
              type="text"
              value={manualJobOffer.location}
              onChange={(e) => handleManualJobOfferChange('location', e.target.value)}
              placeholder="Ex: Paris, Télétravail"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Option IA */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={options.useAI}
            onChange={(e) => setOptions({...options, useAI: e.target.checked})}
            className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="text-sm font-medium text-purple-900 dark:text-purple-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Utiliser l'IA Hugging Face pour personnaliser le contenu</span>
            </span>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
              L'IA analysera votre profil et l'offre pour créer un contenu personnalisé et pertinent
            </p>
          </div>
        </label>
      </div>

      {/* Ton de la lettre */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Style de rédaction
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setOptions({...options, tone: tone.id})}
              className={`p-3 text-left border rounded-lg transition-all ${
                options.tone === tone.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-sm font-medium block">
                {tone.label}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tone.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Aperçu de l'offre sélectionnée */}
      {(selectedOffer || (manualMode && manualJobOffer.title)) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Offre sélectionnée</span>
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Poste:</strong> {getSelectedJobOffer()?.title}</p>
            <p><strong>Entreprise:</strong> {getSelectedJobOffer()?.company}</p>
            {getSelectedJobOffer()?.location && (
              <p><strong>Localisation:</strong> {getSelectedJobOffer()?.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Bouton de génération */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !isFormValid()}
        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-green-400 disabled:to-blue-400 text-white rounded-lg transition-all font-medium"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            {options.useAI ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span>
              Générer avec {options.useAI ? 'IA Hugging Face' : 'Template LaTeX'} (GRATUIT)
            </span>
          </>
        )}
      </button>

      {/* Avertissements */}
      {!isFormValid() && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Éléments requis pour générer votre lettre
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-500 mt-1 space-y-1">
                {!userProfile && <li>• Profil utilisateur complet</li>}
                {!getSelectedJobOffer()?.title?.trim() && <li>• Titre du poste</li>}
                {!getSelectedJobOffer()?.company?.trim() && <li>• Nom de l'entreprise</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;