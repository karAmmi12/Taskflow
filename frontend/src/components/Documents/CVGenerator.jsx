import { useState } from 'react';
import { FileText, Wand2, Loader2, AlertCircle } from 'lucide-react';


const downloadDocument = async (documentId, filename) => {
  try {
    const response = await fetch(`/api/documents/download/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error('Erreur téléchargement');
    }
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    alert('❌ Erreur lors du téléchargement');
  }
};

const CVGenerator = ({ userProfile }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [options, setOptions] = useState({
    color: 'blue',
    includePhoto: false,
    sections: ['experience', 'education', 'skills', 'languages']
  });

  const templates = [
    { id: 'modern', name: 'Moderne', description: 'Design contemporain avec couleurs' },
    { id: 'classic', name: 'Classique', description: 'Style traditionnel et sobre' },
    { id: 'simple', name: 'Simple', description: 'Template minimaliste et épuré' },
    { id: 'academic', name: 'Académique', description: 'Pour recherche/enseignement' }
  ];

  const colors = ['blue', 'green', 'red', 'purple', 'orange', 'teal'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/documents/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          options
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // 🔧 Utiliser le téléchargement sécurisé
        await downloadDocument(data.document.id, data.document.filename);
        alert('✅ CV généré avec succès (Templates personnalisés) !');
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de la génération du CV');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Générateur de CV Personnalisé
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Créez un CV professionnel avec vos données personnalisées
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-800 dark:text-green-400">
            🚀 Templates LaTeX Professionnels
          </span>
        </div>
      </div>

      {/* Sélection du template */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Choisir un template
        </label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
              }`}
            >
              <h3 className="font-medium text-slate-900 dark:text-white">
                {template.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Options de couleur */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Couleur principale
        </label>
        <div className="flex space-x-3">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setOptions({...options, color})}
              className={`w-8 h-8 rounded-full border-2 ${
                options.color === color ? 'border-slate-400' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Sections à inclure */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Sections à inclure
        </label>
        <div className="space-y-2">
          {[
            { id: 'experience', label: 'Expérience professionnelle' },
            { id: 'education', label: 'Formation' },
            { id: 'skills', label: 'Compétences' },
            { id: 'languages', label: 'Langues' },
            { id: 'hobbies', label: 'Centres d\'intérêt' }
          ].map((section) => (
            <label key={section.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.sections.includes(section.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setOptions({
                      ...options,
                      sections: [...options.sections, section.id]
                    });
                  } else {
                    setOptions({
                      ...options,
                      sections: options.sections.filter(s => s !== section.id)
                    });
                  }
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {section.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bouton de génération */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !userProfile}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Générer mon CV personnalisé</span>
          </>
        )}
      </button>

      {!userProfile && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Profil requis
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                Complétez votre profil dans l'onglet "Mon Profil" pour générer un CV personnalisé.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVGenerator;