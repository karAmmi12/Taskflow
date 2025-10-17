const { HfInference } = require('@huggingface/inference');

class AIService {
    constructor() {
        this.hf = null;
        this.isEnabled = false;
        this.activeModel = null;
        this.activeProvider = null;
        this.cache = new Map();
        
        // Configuration des providers et modèles disponibles
        this.providers = [
            {
                name: 'novita',
                models: [
                    'zai-org/GLM-4.6',
                    'meta-llama/Llama-3.1-8B-Instruct',
                    'microsoft/DialoGPT-medium'
                ]
            },
            {
                name: 'huggingface',
                models: [
                    'microsoft/DialoGPT-small',
                    'distilgpt2',
                    'gpt2'
                ]
            }
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
            
            // Tester les providers et modèles disponibles
            await this.findWorkingProvider();
            
        } catch (error) {
            console.error('❌ Erreur initialisation IA:', error.message);
        }
    }

    async findWorkingProvider() {
        console.log('🔍 Recherche d\'un provider et modèle fonctionnel...');
        
        // Tester d'abord le provider Novita (le plus fiable)
        for (const provider of this.providers) {
            console.log(`🧪 Test du provider: ${provider.name}`);
            
            for (const model of provider.models) {
                try {
                    console.log(`   🔍 Test du modèle: ${model}`);
                    
                    let response;
                    
                    if (provider.name === 'novita') {
                        // Utiliser la nouvelle API avec provider
                        response = await Promise.race([
                            this.hf.chatCompletion({
                                provider: "novita",
                                model: model,
                                messages: [
                                    {
                                        role: "user",
                                        content: "Write one professional sentence for a job application in French."
                                    }
                                ],
                                max_tokens: 50,
                                temperature: 0.7
                            }),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 15000)
                            )
                        ]);
                    } else {
                        // Utiliser l'API text generation classique
                        response = await Promise.race([
                            this.hf.textGeneration({
                                model: model,
                                inputs: "Écrivez une phrase professionnelle de motivation:",
                                parameters: {
                                    max_new_tokens: 30,
                                    temperature: 0.7,
                                    do_sample: true,
                                    return_full_text: false
                                }
                            }),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 15000)
                            )
                        ]);
                    }

                    // Vérifier la réponse
                    let generatedText = '';
                    if (response?.choices?.[0]?.message?.content) {
                        generatedText = response.choices[0].message.content;
                    } else if (response?.generated_text) {
                        generatedText = response.generated_text;
                    }

                    if (generatedText && generatedText.trim().length > 15) {
                        this.activeProvider = provider.name;
                        this.activeModel = model;
                        this.isEnabled = true;
                        console.log(`✅ Provider actif: ${provider.name}`);
                        console.log(`✅ Modèle actif: ${model}`);
                        console.log(`📝 Test réussi: "${generatedText.substring(0, 60)}..."`);
                        return;
                    }
                    
                } catch (error) {
                    console.log(`   ❌ ${model}: ${error.message}`);
                    continue;
                }
            }
        }
        
        console.log('⚠️ Aucun provider/modèle IA disponible - mode templates uniquement');
    }

    async generateCoverLetterContent(userProfile, jobOffer, tone = 'professionnel') {
        if (!this.isEnabled) {
            throw new Error('IA non disponible - Aucun provider fonctionnel');
        }

        const cacheKey = `cover_${userProfile.id}_${jobOffer.title}_${tone}`;
        if (this.cache.has(cacheKey)) {
            console.log('💾 Cache IA utilisé');
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = this.buildCoverLetterPrompt(userProfile, jobOffer, tone);
            console.log('🤖 Génération contenu IA...');
            
            let response;
            
            if (this.activeProvider === 'novita') {
                // Utiliser Chat Completion avec Novita
                response = await Promise.race([
                    this.hf.chatCompletion({
                        provider: "novita",
                        model: this.activeModel,
                        messages: [
                            {
                                role: "system",
                                content: "Tu es un assistant spécialisé dans la rédaction de lettres de motivation professionnelles en français. Réponds uniquement avec le contenu demandé, sans introduction ni explication."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        max_tokens: 150,
                        temperature: 0.8,
                        top_p: 0.9
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout génération IA')), 25000)
                    )
                ]);
                
                console.log('📝 Réponse Novita reçue');
            } else {
                // Utiliser Text Generation classique
                response = await Promise.race([
                    this.hf.textGeneration({
                        model: this.activeModel,
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: 100,
                            temperature: 0.8,
                            top_p: 0.9,
                            repetition_penalty: 1.1,
                            do_sample: true,
                            return_full_text: false,
                            stop: ['\n\n', 'Cordialement', 'Salutations']
                        }
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout génération IA')), 20000)
                    )
                ]);
            }

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
        
        // Instructions de ton en français
        let toneInstruction = '';
        switch (tone) {
            case 'dynamique':
                toneInstruction = 'Utilise un ton énergique et enthousiaste.';
                break;
            case 'créatif':
                toneInstruction = 'Sois créatif et original.';
                break;
            case 'formel':
                toneInstruction = 'Utilise un ton très formel et respectueux.';
                break;
            default:
                toneInstruction = 'Utilise un ton professionnel et courtois.';
        }

        const experienceText = experiences.length > 0 
            ? experiences.slice(0, 2).map(exp => `${exp.title} chez ${exp.company}`).join(', ')
            : 'Formation récente';
            
        const skillsText = skills.length > 0 
            ? skills.slice(0, 5).join(', ')
            : 'compétences en développement';

        // Prompt optimisé en français pour Novita
        return `Rédigez un paragraphe de motivation de 2-3 phrases pour une lettre de candidature.

Candidat: ${user.name || 'Candidat'}
Expérience: ${experienceText}
Compétences: ${skillsText}
Poste visé: ${jobOffer.title}
Entreprise: ${jobOffer.company}

Instructions: ${toneInstruction} Écris uniquement le paragraphe de motivation, pas la lettre complète. Concentre-toi sur pourquoi le candidat est parfait pour ce poste.

Paragraphe de motivation:`;
    }

    extractContent(response) {
        if (!response) return '';
        
        let content = '';
        
        // Réponse Chat Completion (Novita)
        if (response.choices?.[0]?.message?.content) {
            content = response.choices[0].message.content;
        }
        // Réponse Text Generation classique
        else if (response.generated_text) {
            content = response.generated_text;
        }
        // Réponse en tableau
        else if (Array.isArray(response) && response[0]?.generated_text) {
            content = response[0].generated_text;
        }
        // Réponse string directe
        else if (typeof response === 'string') {
            content = response;
        }
        
        return content.trim();
    }

    cleanAndValidateContent(content, jobOffer) {
        if (!content || content.length < 20) {
            // Fallback de qualité en français
            const fallbacks = [
                `Mon expérience et mes compétences correspondent parfaitement aux exigences du poste de ${jobOffer.title}. Je suis très motivé(e) à rejoindre ${jobOffer.company} et à contribuer activement à ses projets.`,
                `Fort(e) de mon parcours, je suis convaincu(e) d'être le candidat idéal pour le poste de ${jobOffer.title} chez ${jobOffer.company}. Mon profil apportera une réelle valeur ajoutée à votre équipe.`,
                `Ma formation et mon expérience me permettent d'être immédiatement opérationnel(le) sur le poste de ${jobOffer.title}. Rejoindre ${jobOffer.company} représenterait une opportunité formidable de développement.`
            ];
            
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        // Nettoyer le contenu
        content = content
            .replace(/^["'\s]+|["'\s]+$/g, '') // Enlever guillemets et espaces
            .replace(/\n+/g, ' ') // Remplacer retours à la ligne
            .replace(/\s+/g, ' ') // Normaliser espaces
            .trim();

        // Enlever les instructions résiduelles
        content = content.replace(/^(Rédigez|Paragraphe de motivation|Candidat|Expérience|Instructions)[:.]?\s*/i, '');

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
        if (content.length < 40) {
            return `Mon profil correspond parfaitement au poste de ${jobOffer.title} chez ${jobOffer.company}. Mes compétences me permettront de contribuer efficacement à vos projets et je serais ravi(e) de rejoindre votre équipe.`;
        }

        return content;
    }

    async testConnection() {
        if (!this.isEnabled) {
            return {
                success: false,
                error: 'IA non configurée ou non disponible',
                provider: `Hugging Face (${this.activeProvider || 'aucun'})`
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
                provider: `Hugging Face (${this.activeProvider})`,
                model: this.activeModel,
                sample: content.substring(0, 80) + '...',
                message: 'IA opérationnelle'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                provider: `Hugging Face (${this.activeProvider})`,
                model: this.activeModel
            };
        }
    }

    getStatus() {
        return {
            enabled: this.isEnabled,
            provider: this.activeProvider,
            model: this.activeModel,
            platform: 'Hugging Face',
            cacheSize: this.cache.size
        };
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache IA nettoyé');
    }
}

module.exports = new AIService();