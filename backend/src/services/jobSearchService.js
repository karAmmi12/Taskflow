const axios = require('axios');

class JobSearchService {
    constructor() {
        // Configuration des APIs
        this.apis = {
            adzuna: {
                baseUrl: 'https://api.adzuna.com/v1/api/jobs/fr/search/1',
                appId: process.env.ADZUNA_APP_ID,
                appKey: process.env.ADZUNA_APP_KEY,
                enabled: !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY)
            },
            jobsearch: {
                baseUrl: 'https://jobsearch.api.jobtome.com/api/v2/jobs',
                apiKey: process.env.JOBTOME_API_KEY,
                enabled: !!process.env.JOBTOME_API_KEY
            }
        };

         // Debug: Afficher le statut des APIs au démarrage
        console.log('🔧 Configuration des APIs d\'emploi:');
        console.log('   Adzuna:', this.apis.adzuna.enabled ? '✅ Activée' : '❌ Désactivée');
        console.log('   JobTome:', this.apis.jobsearch.enabled ? '✅ Activée' : '❌ Désactivée');
    }

    // Recherche via Adzuna (France)
    async searchAdzuna(alert) {
        if (!this.apis.adzuna.enabled) {
            console.log('❌ Adzuna API non configurée');
            return [];
        }
        if (!alert.keywords || alert.keywords.length === 0) {
            console.log('❌ Aucun mot-clé défini pour cette alerte');
            return [];
        }

        try {
            const searchQuery = alert.keywords.join(' ');
            const params = {
                app_id: this.apis.adzuna.appId,
                app_key: this.apis.adzuna.appKey,
                what: searchQuery,
                where: alert.location || 'France',
                results_per_page: 20,
                sort_by: 'date'
            };

            console.log(`🔍 Requête Adzuna:`, {
                what: params.what,
                where: params.where,
                results_per_page: params.results_per_page
            });

            const response = await axios.get(this.apis.adzuna.baseUrl, { params });
            
            console.log(`📊 Adzuna réponse:`, {
                found: response.data.results?.length || 0,
                total_available: response.data.count || 0
            });

            if (!response.data.results || response.data.results.length === 0) {
                console.log('ℹ️ Aucun résultat Adzuna');
                return [];
            }

            const processedJobs = response.data.results.map(job => ({
                id: `adzuna_${job.id}`,
                title: job.title,
                company: job.company?.display_name || 'Entreprise non spécifiée',
                location: job.location?.display_name || 'Localisation non spécifiée',
                salary: job.salary_min ? `${Math.round(job.salary_min/1000)}k€+` : null,
                contract: job.contract_type || null,
                description: job.description || 'Description non disponible',
                url: job.redirect_url,
                source: 'Adzuna',
                publishedAt: new Date(job.created),
                matchScore: this.calculateMatchScore(alert, job)
            }));

            // Afficher quelques exemples
            console.log(`📋 Exemples d'offres Adzuna:`, 
                processedJobs.slice(0, 2).map(job => `"${job.title}" chez ${job.company} (score: ${job.matchScore}%)`)
            );

            return processedJobs;

        } catch (error) {
            console.error('❌ Erreur Adzuna API:', {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            return [];
        }
    }

    // Recherche via JobTome (international)
    async searchJobTome(alert) {
        if (!this.apis.jobsearch.enabled) {
            console.log('JobTome API non configurée');
            return [];
        }

        try {
            const params = {
                api_key: this.apis.jobsearch.apiKey,
                q: alert.keywords.join(' '),
                l: alert.location || 'France',
                num: 20,
                sort: 'date'
            };

            if (alert.company) {
                params.company = alert.company;
            }

            const response = await axios.get(this.apis.jobsearch.baseUrl, { params });
            
            return response.data.jobs.map(job => ({
                id: `jobtome_${job.jobkey}`,
                title: job.jobtitle,
                company: job.company,
                location: job.formattedLocation,
                salary: job.salary || null,
                contract: null,
                description: job.snippet,
                url: job.url,
                source: 'JobTome',
                publishedAt: new Date(job.date),
                matchScore: this.calculateMatchScore(alert, job)
            }));

        } catch (error) {
            console.error('Erreur JobTome API:', error.response?.data || error.message);
            return [];
        }
    }

    // Recherche combinée toutes APIs
    async searchAllSources(alert) {
        console.log(`🔍 Recherche pour l'alerte: ${alert.title}`);
        
        const promises = [];
        
        if (this.apis.adzuna.enabled) {
            promises.push(this.searchAdzuna(alert));
        }
        
        if (this.apis.jobsearch.enabled) {
            promises.push(this.searchJobTome(alert));
        }

        try {
            const results = await Promise.all(promises);
            const allJobs = results.flat();
            
            // Dédupliquer par titre + entreprise
            const uniqueJobs = this.deduplicateJobs(allJobs);
            
            // Trier par score de pertinence
            return uniqueJobs
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 50); // Limiter à 50 résultats max
                
        } catch (error) {
            console.error('Erreur recherche multi-sources:', error);
            return [];
        }
    }

    // Calcul du score de pertinence
    calculateMatchScore(alert, job) {
        let score = 0;
        
        // Correspondance mots-clés dans le titre (poids: 40%)
        const titleKeywords = alert.keywords.filter(keyword => 
            job.title?.toLowerCase().includes(keyword.toLowerCase())
        );
        score += (titleKeywords.length / alert.keywords.length) * 40;
        
        // Correspondance entreprise (poids: 20%)
        if (alert.company && job.company?.toLowerCase().includes(alert.company.toLowerCase())) {
            score += 20;
        }
        
        // Correspondance localisation (poids: 15%)
        if (alert.location && job.location) {
            // Pour Adzuna: job.location est déjà transformé en string dans searchAdzuna
            // Pour JobTome: job.location est directement une string
            const jobLocationStr = typeof job.location === 'string' 
                ? job.location.toLowerCase() 
                : job.location.display_name?.toLowerCase() || '';
            
            if (jobLocationStr.includes(alert.location.toLowerCase())) {
                score += 15;
            }
        }
        
        // Correspondance type de contrat (poids: 10%)
        if (alert.contract && job.contract?.toLowerCase() === alert.contract.toLowerCase()) {
            score += 10;
        }
        
        // Fraîcheur de l'offre (poids: 15%)
        const daysSincePublished = (Date.now() - new Date(job.publishedAt)) / (1000 * 60 * 60 * 24);
        if (daysSincePublished <= 1) score += 15;
        else if (daysSincePublished <= 7) score += 10;
        else if (daysSincePublished <= 30) score += 5;
        
        return Math.round(score);
    }

    // Déduplication des offres
    deduplicateJobs(jobs) {
        const seen = new Map();
        
        return jobs.filter(job => {
            const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
            if (seen.has(key)) {
                // Garder celui avec le meilleur score
                const existing = seen.get(key);
                if (job.matchScore > existing.matchScore) {
                    seen.set(key, job);
                    return true;
                }
                return false;
            } else {
                seen.set(key, job);
                return true;
            }
        });
    }

    // Vérifier la configuration des APIs
    getApiStatus() {
        return {
            adzuna: this.apis.adzuna.enabled,
            jobTome: this.apis.jobsearch.enabled,
            total: Object.values(this.apis).filter(api => api.enabled).length
        };
    }

     // Tester la connexion à l'API Adzuna
    async testAdzunaConnection() {
        if (!this.apis.adzuna.enabled) {
            return { success: false, error: 'API non configurée' };
        }

        try {
            const testParams = {
                app_id: this.apis.adzuna.appId,
                app_key: this.apis.adzuna.appKey,
                what: 'test',
                results_per_page: 1
            };

            const response = await axios.get(this.apis.adzuna.baseUrl, { 
                params: testParams,
                timeout: 10000 // 10 secondes
            });

            return { 
                success: true, 
                message: `Connexion réussie - ${response.data.count || 0} offres disponibles` 
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || error.message,
                status: error.response?.status
            };
        }
    }

    // Test avec une alerte factice
    async testWithRealAlert() {
        const testAlert = {
            title: "Test Auxiliaire Petite Enfance",
            keywords: ["auxiliaire", "petite", "enfance"],
            location: "Ile-de-France",
            contract: "contract",
            company: null,
            salary: null
        };

        console.log('🧪 Test avec alerte factice:', testAlert);
        
        try {
            const results = await this.searchAllSources(testAlert);
            console.log('🎉 Résultats du test:', {
                totalFound: results.length,
                topOffers: results.slice(0, 3).map(offer => ({
                    title: offer.title,
                    company: offer.company,
                    score: offer.matchScore,
                    source: offer.source
                }))
            });
            return results;
        } catch (error) {
            console.error('❌ Erreur test:', error);
            return [];
        }
    }
}

module.exports = new JobSearchService();