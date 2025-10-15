import { useState, useEffect } from 'react';
import { User, Save, Plus, Trash2 } from 'lucide-react';

const ProfileForm = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    hobbies: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile || profile);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Profil mis à jour avec succès !');
        onProfileUpdate && onProfileUpdate(data.profile);
      } else {
        setMessage(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experiences: [
        ...profile.experiences,
        { title: '', company: '', startDate: '', endDate: '', description: '' }
      ]
    });
  };

  const removeExperience = (index) => {
    setProfile({
      ...profile,
      experiences: profile.experiences.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index, field, value) => {
    const newExperiences = [...profile.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setProfile({ ...profile, experiences: newExperiences });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Mon Profil
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Complétez votre profil pour des documents personnalisés
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('succès') 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => setProfile({...profile, address: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={profile.linkedin || ''}
              onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
              placeholder="https://linkedin.com/in/votre-profil"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              GitHub
            </label>
            <input
              type="url"
              value={profile.github || ''}
              onChange={(e) => setProfile({...profile, github: e.target.value})}
              placeholder="https://github.com/votre-username"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Résumé professionnel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Résumé professionnel
          </label>
          <textarea
            value={profile.summary || ''}
            onChange={(e) => setProfile({...profile, summary: e.target.value})}
            rows={4}
            placeholder="Décrivez brièvement votre profil professionnel..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Expériences */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Expériences professionnelles
            </label>
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
          
          {profile.experiences.map((exp, index) => (
            <div key={index} className="mb-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-slate-900 dark:text-white">Expérience {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Titre du poste"
                  value={exp.title || ''}
                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Entreprise"
                  value={exp.company || ''}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Date de début"
                  value={exp.startDate || ''}
                  onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Date de fin"
                  value={exp.endDate || ''}
                  onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <textarea
                placeholder="Description des missions"
                value={exp.description || ''}
                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                rows={3}
                className="w-full mt-3 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          ))}
        </div>

        {/* Compétences */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Compétences (séparées par des virgules)
          </label>
          <input
            type="text"
            value={profile.skills.join(', ')}
            onChange={(e) => setProfile({...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
            placeholder="JavaScript, React, Node.js, Python..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Sauvegarder le profil</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;