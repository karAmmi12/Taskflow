const { HfInference } = require('@huggingface/inference');

class AIService {
    constructor() {
        this.hf = null;
        this.isEnabled = false;
        this.activeModel = null;
        this.cache = new Map();
        
        // Modèles optimisés pour la génération de texte professionnel
        this.models = [
            'microsoft/DialoGPT-medium',
            'gpt2-medium',
            'distilgpt2',
            'facebook/blenderbot-400M-distill'
        ];
        
        this.initialize();
    }

    async initialize() {
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        
        if (!apiKey) {
            console.log('⚠️ IA Hugging Face non configurée - clé API manquante');
            return;
        }

        try {
            this.hf = new HfInference(apiKey);
            console.log('🔧 Initialisation IA Hugging Face...');
            
            // Tester les modèles disponibles
            await this.findWorkingModel();
            
        } catch (error) {
            console.error('❌ Erreur initialisation IA:', error.message);
        }
    }

    async findWorkingModel() {
        console.log('🔍 Recherche d\'un modèle IA fonctionnel...');
        
        for (const model of this.models) {
            try {
                console.log(`🧪 Test du modèle: ${model}`);
                
                const response = await Promise.race([
                    this.hf.textGeneration({
                        model,
                        inputs: "Bonjour, je suis",
                        parameters: {
                            max_new_tokens: 15,
                            temperature: 0.7,
                            do_sample: true,
                            return_full_text: false
                        }
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 10000)
                    )
                ]);

                if (response && response.generated_text) {
                    const text = response.generated_text.trim();
                    if (text.length > 5) {
                        this.activeModel = model;
                        this.isEnabled = true;
                        console.log(`✅ Modèle actif: ${model}`);
                        console.log(`📝 Test: "Bonjour, je suis${text}"`);
                        return;
                    }
                }
            } catch (error) {
                console.log(`❌ ${model}: ${error.message}`);
                continue;
            }
        }
        
        console.log('⚠️ Aucun modèle IA disponible - mode templates uniquement');
    }

    async generateCoverLetterContent(userProfile, jobOffer, tone = 'professionnel') {
        if (!this.isEnabled) {
            throw new Error('IA non disponible');
        }

        const cacheKey = `cover_${userProfile.id}_${jobOffer.title}_${tone}`;
        if (this.cache.has(cacheKey)) {
            console.log('💾 Cache IA utilisé');
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = this.buildCoverLetterPrompt(userProfile, jobOffer, tone);
            console.log('🤖 Génération contenu IA...');
            
            const response = await Promise.race([
                this.hf.textGeneration({
                    model: this.activeModel,
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 120,
                        temperature: 0.8,
                        top_p: 0.9,
                        repetition_penalty: 1.2,
                        do_sample: true,
                        return_full_text: false,
                        stop: ['\n\n', 'Cordialement', 'Salutations', 'Madame', 'Monsieur']
                    }
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout génération IA')), 15000)
                )
            ]);

            let content = this.extractContent(response);
            content = this.cleanAndValidateContent(content, jobOffer);
            
            // Mettre en cache
            if (this.cache.size >= 50) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(cacheKey, content);
            
            console.log(`✅ Contenu IA généré: ${content.length} caractères`);
            return content;
            
        } catch (error) {
            console.error('❌ Erreur génération IA:', error.message);
            throw new Error(`Génération IA échouée: ${error.message}`);
        }
    }

    buildCoverLetterPrompt(userProfile, jobOffer, tone) {
        const user = userProfile.user || {};
        const experiences = userProfile.experiences || [];
        const skills = userProfile.skills || [];
        
        // Instructions de ton
        let toneInstruction = '';
        switch (tone) {
            case 'dynamique':
                toneInstruction = 'Ton énergique et enthousiaste.';
                break;
            case 'créatif':
                toneInstruction = 'Ton original et créatif.';
                break;
            case 'formel':
                toneInstruction = 'Ton très formel et respectueux.';
                break;
            default:
                toneInstruction = 'Ton professionnel et courtois.';
        }

        const experienceText = experiences.length > 0 
            ? experiences.slice(0, 2).map(exp => `${exp.title} chez ${exp.company}`).join(', ')
            : 'Formation récente';
            
        const skillsText = skills.length > 0 
            ? skills.slice(0, 5).join(', ')
            : 'compétences en développement';

        return `Rédigez un paragraphe de motivation professionnelle de 2-3 phrases pour une lettre de motivation.

Candidat: ${user.name || 'Candidat'}
Expérience: ${experienceText}
Compétences: ${skillsText}
Poste visé: ${jobOffer.title}
Entreprise: ${jobOffer.company}

${toneInstruction} Mettez en avant l'adéquation entre le profil et le poste.

Paragraphe de motivation:`;
    }

    extractContent(response) {
        if (!response) return '';
        
        let content = '';
        if (response.generated_text) {
            content = response.generated_text;
        } else if (Array.isArray(response) && response[0]?.generated_text) {
            content = response[0].generated_text;
        } else if (typeof response === 'string') {
            content = response;
        }
        
        return content.trim();
    }

    cleanAndValidateContent(content, jobOffer) {
        if (!content || content.length < 10) {
            // Fallback si le contenu est trop court
            return `Mon expérience et mes compétences correspondent parfaitement aux exigences du poste de ${jobOffer.title}. Je suis très motivé(e) à rejoindre ${jobOffer.company} et à contribuer activement à ses projets. Mon profil apportera une réelle valeur ajoutée à votre équipe.`;
        }

        // Nettoyer le contenu
        content = content
            .replace(/^["'\s]+|["'\s]+$/g, '') // Enlever guillemets et espaces
            .replace(/\n+/g, ' ') // Remplacer retours à la ligne
            .replace(/\s+/g, ' ') // Normaliser espaces
            .trim();

        // Limiter à 3 phrases maximum
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length > 3) {
            content = sentences.slice(0, 3).join('. ').trim() + '.';
        }

        // S'assurer qu'il y a une ponctuation finale
        if (!content.match(/[.!?]$/)) {
            content += '.';
        }

        // Vérification de longueur finale
        if (content.length < 50) {
            return `Mon profil correspond parfaitement au poste de ${jobOffer.title} chez ${jobOffer.company}. Mes compétences et mon expérience me permettront de contribuer efficacement à vos projets. Je serais ravi(e) de rejoindre votre équipe dynamique.`;
        }

        return content;
    }

    async testConnection() {
        if (!this.isEnabled) {
            return {
                success: false,
                error: 'IA non configurée ou non disponible',
                provider: 'Hugging Face'
            };
        }

        try {
            const testProfile = {
                id: 'test',
                user: { name: 'Test User' },
                experiences: [{ title: 'Développeur', company: 'Tech Corp' }],
                skills: ['JavaScript', 'React', 'Node.js']
            };

            const testJobOffer = {
                title: 'Développeur Frontend',
                company: 'Entreprise Test'
            };

            const content = await this.generateCoverLetterContent(testProfile, testJobOffer);

            return {
                success: true,
                provider: 'Hugging Face',
                model: this.activeModel,
                sample: content.substring(0, 80) + '...',
                message: 'IA opérationnelle'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                provider: 'Hugging Face',
                model: this.activeModel
            };
        }
    }

    getStatus() {
        return {
            enabled: this.isEnabled,
            model: this.activeModel,
            provider: 'Hugging Face',
            cacheSize: this.cache.size
        };
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache IA nettoyé');
    }
}

module.exports = new AIService();