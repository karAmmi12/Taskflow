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
            franceTravail: {
                baseUrl: 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search',
                tokenUrl: 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire', // ✅ URL corrigée
                clientId: process.env.FRANCE_TRAVAIL_CLIENT_ID,
                clientSecret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET,
                enabled: !!(process.env.FRANCE_TRAVAIL_CLIENT_ID && process.env.FRANCE_TRAVAIL_CLIENT_SECRET),
                token: null,
                tokenExpiry: null
            }
        };

         // Debug: Afficher le statut des APIs au démarrage
        console.log('🔧 Configuration des APIs d\'emploi:');
        console.log('   Adzuna:', this.apis.adzuna.enabled ? '✅ Activée' : '❌ Désactivée');
        console.log('   France Travail:', this.apis.franceTravail.enabled ? '✅ Activée' : '❌ Désactivée');

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


    // Authentification France Travail (OAuth2)
    async getFranceTravailToken() {
        if (!this.apis.franceTravail.enabled) {
            return null;
        }

        // Vérifier si le token est encore valide
        if (this.apis.franceTravail.token && 
            this.apis.franceTravail.tokenExpiry && 
            Date.now() < this.apis.franceTravail.tokenExpiry) {
            return this.apis.franceTravail.token;
        }

        try {
            const params = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.apis.franceTravail.clientId,
                client_secret: this.apis.franceTravail.clientSecret,
                scope: 'api_offresdemploiv2 o2dsoffre'
            });

            const response = await axios.post(this.apis.franceTravail.tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.apis.franceTravail.token = response.data.access_token;
            this.apis.franceTravail.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // -1min de sécurité

            console.log('✅ Token France Travail obtenu');
            return this.apis.franceTravail.token;

        } catch (error) {
            console.error('❌ Erreur authentification France Travail:', error.response?.data || error.message);
            return null;
        }
    }

     // Recherche via France Travail
    async searchFranceTravail(alert) {
        if (!this.apis.franceTravail.enabled) {
            console.log('❌ France Travail API non configurée');
            return [];
        }

        if (!alert.keywords || alert.keywords.length === 0) {
            console.log('❌ Aucun mot-clé défini pour cette alerte');
            return [];
        }

        try {
            const token = await this.getFranceTravailToken();
            if (!token) {
                console.log('❌ Impossible d\'obtenir le token France Travail');
                return [];
            }

            const searchQuery = alert.keywords.join(' ');
            const params = {
                motsCles: searchQuery,
                range: '0-19', // 20 résultats max
                sort: '1' // Tri par date de création décroissante
            };

            // Ajouter la localisation si spécifiée
            if (alert.location) {
                params.commune = alert.location;
            }

            // Ajouter le type de contrat si spécifié
            if (alert.contract) {
                const contractMapping = {
                    'CDI': 'CDI',
                    'CDD': 'CDD',
                    'Stage': 'MIS,DIN', // Mission intérimaire, Détachement
                    'Alternance': 'SAI', // Contrat d'apprentissage/professionnalisation
                    'Freelance': 'LIB' // Profession libérale
                };
                params.typeContrat = contractMapping[alert.contract] || alert.contract;
            }

            console.log(`🔍 Requête France Travail:`, {
                motsCles: params.motsCles,
                commune: params.commune,
                typeContrat: params.typeContrat
            });

            const response = await axios.get(this.apis.franceTravail.baseUrl, { 
                params,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log(`📊 France Travail réponse:`, {
                found: response.data.resultats?.length || 0,
                total_available: response.data.filtresPossibles?.nbResultats || 0
            });

            if (!response.data.resultats || response.data.resultats.length === 0) {
                console.log('ℹ️ Aucun résultat France Travail');
                return [];
            }

            const processedJobs = response.data.resultats.map(job => ({
                id: `francetravail_${job.id}`,
                title: job.intitule,
                company: job.entreprise?.nom || 'Entreprise non spécifiée',
                location: job.lieuTravail?.libelle || 'Localisation non spécifiée',
                salary: job.salaire?.libelle || null,
                contract: this.mapFranceTravailContract(job.typeContrat),
                description: job.description || 'Description non disponible',
                url: job.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`,
                source: 'France Travail',
                publishedAt: new Date(job.dateCreation),
                matchScore: this.calculateMatchScore(alert, {
                    ...job,
                    title: job.intitule,
                    company: job.entreprise?.nom,
                    location: job.lieuTravail?.libelle,
                    contract: this.mapFranceTravailContract(job.typeContrat)
                })
            }));

            // Afficher quelques exemples
            console.log(`📋 Exemples d'offres France Travail:`, 
                processedJobs.slice(0, 2).map(job => `"${job.title}" chez ${job.company} (score: ${job.matchScore}%)`)
            );

            return processedJobs;

        } catch (error) {
            console.error('❌ Erreur France Travail API:', {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            return [];
        }
    }

    // Mapper les types de contrat France Travail
    mapFranceTravailContract(typeContrat) {
        const mapping = {
            'CDI': 'CDI',
            'CDD': 'CDD',
            'MIS': 'Intérim',
            'SAI': 'Alternance',
            'LIB': 'Libéral',
            'REP': 'Remplacement',
            'FRA': 'Franchise'
        };
        return mapping[typeContrat] || typeContrat || null;
    }

    // Recherche combinée toutes APIs
    async searchAllSources(alert) {
        console.log(`🔍 Recherche pour l'alerte: ${alert.title}`);
        
        const promises = [];
        
        if (this.apis.adzuna.enabled) {
            promises.push(this.searchAdzuna(alert));
        }
        
        if (this.apis.franceTravail.enabled) {
            promises.push(this.searchFranceTravail(alert));
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
            franceTravail: this.apis.franceTravail.enabled,
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

    // Tester la connexion à France Travail
    async testFranceTravailConnection() {
        if (!this.apis.franceTravail.enabled) {
            return { success: false, error: 'API non configurée' };
        }

        try {
            const token = await this.getFranceTravailToken();
            if (!token) {
                return { success: false, error: 'Impossible d\'obtenir le token' };
            }

            const testParams = {
                motsCles: 'test',
                range: '0-0' // Juste pour tester
            };

            const response = await axios.get(this.apis.franceTravail.baseUrl, { 
                params: testParams,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            return { 
                success: true, 
                message: `Connexion réussie - ${response.data.filtresPossibles?.nbResultats || 0} offres disponibles` 
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