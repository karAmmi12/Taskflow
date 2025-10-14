import { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon, Bell } from 'lucide-react';

const JobAlertModal = ({ isOpen, onClose, onSubmit, alert }) => {
  const [formData, setFormData] = useState({
    title: '',
    keywords: [],
    location: '',
    company: '',
    salary: '',
    contract: '',
    frequency: 'daily',
    active: true,
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (alert) {
      setFormData({
        title: alert.title || '',
        keywords: alert.keywords || [],
        location: alert.location || '',
        company: alert.company || '',
        salary: alert.salary || '',
        contract: alert.contract || '',
        frequency: alert.frequency || 'daily',
        active: alert.active !== undefined ? alert.active : true,
      });
    } else {
      setFormData({
        title: '',
        keywords: [],
        location: '',
        company: '',
        salary: '',
        contract: '',
        frequency: 'daily',
        active: true,
      });
    }
    setKeywordInput('');
  }, [alert, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

    const handleAddKeyword = () => {
        console.log('🔍 Ajout mot-clé:', keywordInput.trim()); // DEBUG
        
        if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
            setFormData((prev) => {
                const newKeywords = [...prev.keywords, keywordInput.trim()];
                console.log('🔍 Nouveaux mots-clés:', newKeywords); // DEBUG
                return {
                    ...prev,
                    keywords: newKeywords,
                };
            });
            setKeywordInput('');
        } else if (!keywordInput.trim()) {
            console.log('⚠️ Mot-clé vide détecté');
        } else if (formData.keywords.includes(keywordInput.trim())) {
            console.log('⚠️ Mot-clé déjà présent:', keywordInput.trim());
        }
    };

  const handleRemoveKeyword = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleKeywordInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
    if (e.key === ',' && keywordInput.trim()) {
        e.preventDefault();
        handleAddKeyword();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    
    // 🔍 DEBUG - Vérifier les données avant envoi
    console.log('📋 FormData avant nettoyage:', formData);
    console.log('📋 Keywords type:', typeof formData.keywords, formData.keywords);

    // Nettoyer les données avant soumission
    const cleanedData = {
      ...formData,
      title: formData.title.trim(),
      keywords: formData.keywords, // ⚠️ Vérifier que c'est bien un tableau
      location: formData.location.trim() || null,
      company: formData.company.trim() || null,
      salary: formData.salary.trim() || null,
      contract: formData.contract.trim() || null,
    };
    
    onSubmit(cleanedData);
  };

  if (!isOpen) return null;

  const contractTypes = [
    { value: '', label: 'Tous types' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Alternance', label: 'Alternance' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Télétravail', label: 'Télétravail' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {alert ? 'Modifier l\'alerte' : 'Nouvelle alerte emploi'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Titre de l'alerte *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Ex: Développeur Frontend React"
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mots-clés
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordInputKeyPress}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Ajouter un mot-clé..."
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm rounded-lg"
                  >
                    <TagIcon className="w-3 h-3" />
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Ex: Paris, Télétravail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Entreprise ciblée
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Ex: Google, Microsoft"
                />
              </div>
            </div>

            {/* Salary & Contract */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Salaire
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Ex: 35k-45k€, Min 30k€"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type de contrat
                </label>
                <select
                  name="contract"
                  value={formData.contract}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                >
                  {contractTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Frequency & Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Fréquence de vérification
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Alerte active
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                {alert ? 'Modifier' : 'Créer l\'alerte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobAlertModal;