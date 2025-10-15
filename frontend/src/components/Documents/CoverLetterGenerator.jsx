// import { useState } from 'react';
// import { Mail, Wand2, Loader2, AlertCircle } from 'lucide-react';

// const CoverLetterGenerator = ({ jobOffer, userProfile }) => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [options, setOptions] = useState({
//     tone: 'professionnel',
//     length: 'standard'
//   });

//   const tones = [
//     { id: 'professionnel', label: 'Professionnel' },
//     { id: 'dynamique', label: 'Dynamique' },
//     { id: 'créatif', label: 'Créatif' },
//     { id: 'formel', label: 'Formel' }
//   ];

//   const handleGenerate = async () => {
//     if (!jobOffer) {
//       alert('❌ Aucune offre d\'emploi sélectionnée');
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       const response = await fetch('/api/documents/cover-letter', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           jobOfferId: jobOffer.id,
//           options
//         })
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         window.open(data.document.downloadUrl, '_blank');
//         alert('✅ Lettre de motivation générée avec succès (GRATUIT) !');
//       } else {
//         alert(`❌ Erreur: ${data.error}`);
//       }
//     } catch (error) {
//       alert('❌ Erreur lors de la génération de la lettre');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//       <div className="flex items-center space-x-3 mb-6">
//         <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
//           <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
//         </div>
//         <div>
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
//             Lettre de motivation IA (GRATUIT)
//           </h2>
//           <p className="text-sm text-slate-600 dark:text-slate-400">
//             Générée automatiquement pour cette offre
//           </p>
//         </div>
//       </div>

//       {/* Badge gratuit */}
//       <div className="mb-4">
//         <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium rounded-full">
//           ✨ 100% GRATUIT - Hugging Face
//         </span>
//       </div>

//       {jobOffer && (
//         <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
//           <h3 className="font-medium text-slate-900 dark:text-white">
//             {jobOffer.title}
//           </h3>
//           <p className="text-sm text-slate-600 dark:text-slate-400">
//             {jobOffer.company} • {jobOffer.location}
//           </p>
//         </div>
//       )}

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//             Ton de la lettre
//           </label>
//           <select
//             value={options.tone}
//             onChange={(e) => setOptions({...options, tone: e.target.value})}
//             className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
//           >
//             {tones.map((tone) => (
//               <option key={tone.id} value={tone.id}>
//                 {tone.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           onClick={handleGenerate}
//           disabled={isGenerating || !jobOffer || !userProfile}
//           className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
//         >
//           {isGenerating ? (
//             <>
//               <Loader2 className="w-5 h-5 animate-spin" />
//               <span>Génération en cours...</span>
//             </>
//           ) : (
//             <>
//               <Wand2 className="w-5 h-5" />
//               <span>Générer la lettre avec l'IA (GRATUIT)</span>
//             </>
//           )}
//         </button>

//         {(!jobOffer || !userProfile) && (
//           <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//             <div className="flex items-start space-x-2">
//               <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
//               <div className="text-sm text-yellow-800 dark:text-yellow-300">
//                 {!userProfile && <p>• Vous devez compléter votre profil</p>}
//                 {!jobOffer && <p>• Vous devez sélectionner une offre d'emploi</p>}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CoverLetterGenerator;

import { useState } from 'react';
import { Mail, Wand2, Loader2, AlertCircle } from 'lucide-react';

const CoverLetterGenerator = ({ jobOffer, userProfile }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    tone: 'professionnel',
    length: 'standard'
  });

  const tones = [
    { id: 'professionnel', label: 'Professionnel' },
    { id: 'dynamique', label: 'Dynamique' },
    { id: 'créatif', label: 'Créatif' },
    { id: 'formel', label: 'Formel' }
  ];

  const handleGenerate = async () => {
    if (!jobOffer) {
      alert('❌ Aucune offre d\'emploi sélectionnée');
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
          jobOffer,
          options
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        window.open(data.document.downloadUrl, '_blank');
        alert('✅ Lettre de motivation générée avec succès !');
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Générateur de Lettre de Motivation
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Créez une lettre personnalisée pour chaque candidature
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-800 dark:text-green-400">
            📝 Templates LaTeX Personnalisés
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium rounded-full">
            ✨ 100% GRATUIT
          </span>
        </div>
      </div>

      {/* Options de ton */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Ton de la lettre
        </label>
        <div className="grid grid-cols-2 gap-3">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setOptions({...options, tone: tone.id})}
              className={`p-3 text-left border rounded-lg transition-all ${
                options.tone === tone.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {tone.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bouton de génération */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !jobOffer || !userProfile}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Générer la lettre personnalisée (GRATUIT)</span>
          </>
        )}
      </button>

      {(!jobOffer || !userProfile) && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Éléments requis
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-500 mt-1 space-y-1">
                {!userProfile && <li>• Profil utilisateur complet</li>}
                {!jobOffer && <li>• Offre d'emploi sélectionnée</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;