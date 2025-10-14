const { PrismaClient } = require('@prisma/client');
const jobSearchService = require('./jobSearchService');

const prisma = new PrismaClient();

class AlertProcessor {
        // Traiter une alerte spécifique
    async processAlert(alertId) {
        try {
            const alert = await prisma.jobAlert.findUnique({
                where: { id: alertId },
                include: { user: true }
            });

            if (!alert || !alert.active) {
                console.log(`❌ Alerte ${alertId} inactive ou non trouvée`);
                return { processed: false };
            }

            console.log(`📋 Traitement de l'alerte: "${alert.title}" (User: ${alert.user.email})`);
            console.log(`🔍 Critères: ${alert.keywords.join(', ')} | ${alert.location || 'Toute la France'}`);

            // Rechercher les nouvelles offres
            const newOffers = await jobSearchService.searchAllSources(alert);
            console.log(`📊 ${newOffers.length} offres trouvées par les APIs`);

            if (newOffers.length === 0) {
                await this.updateLastCheck(alertId);
                console.log(`ℹ️ Aucune offre trouvée pour "${alert.title}"`);
                return { processed: true, newOffers: 0, totalFound: 0 };
            }

            // Afficher quelques exemples d'offres trouvées
            console.log(`📋 Exemples d'offres trouvées:`, 
                newOffers.slice(0, 3).map(offer => 
                    `"${offer.title}" chez ${offer.company} (${offer.source}, score: ${offer.matchScore}%)`
                ).join('\n   ')
            );

            // Sauvegarder les nouvelles offres
            let savedCount = 0;
            for (const offer of newOffers) {
                try {
                    const result = await prisma.jobOffer.upsert({
                        where: {
                            externalId_source: {
                                externalId: offer.id,
                                source: offer.source
                            }
                        },
                        create: {
                            externalId: offer.id,
                            title: offer.title,
                            company: offer.company,
                            location: offer.location,
                            salary: offer.salary,
                            contract: offer.contract,
                            description: offer.description?.substring(0, 1000),
                            url: offer.url,
                            source: offer.source,
                            publishedAt: offer.publishedAt,
                            matchScore: offer.matchScore,
                            alertId: alert.id,
                            userId: alert.userId
                        },
                        update: {
                            matchScore: offer.matchScore,
                            updatedAt: new Date()
                        }
                    });
                    
                    // Compter seulement si c'est une nouvelle création
                    if (result.createdAt === result.updatedAt) {
                        savedCount++;
                        console.log(`✅ Nouvelle offre sauvée: "${offer.title}" chez ${offer.company}`);
                    } else {
                        console.log(`🔄 Offre mise à jour: "${offer.title}" chez ${offer.company}`);
                    }
                } catch (error) {
                    console.error(`❌ Erreur sauvegarde offre "${offer.title}":`, error.message);
                }
            }

            // Nettoyer les anciennes offres
            await this.cleanOldOffers(alert.userId);

            // Mettre à jour la date de dernière vérification
            await this.updateLastCheck(alertId);

            console.log(`✅ Traitement terminé pour "${alert.title}": ${savedCount} nouvelles offres sur ${newOffers.length} analysées`);
            
            return { 
                processed: true, 
                newOffers: savedCount,
                totalFound: newOffers.length 
            };

        } catch (error) {
            console.error(`❌ Erreur traitement alerte ${alertId}:`, error);
            return { processed: false, error: error.message };
        }
    }

    // Traiter toutes les alertes actives
    async processAllAlerts() {
        console.log('🚀 Début du traitement de toutes les alertes');
        
        const activeAlerts = await prisma.jobAlert.findMany({
            where: { active: true },
            include: { user: true }
        });

        console.log(`📊 ${activeAlerts.length} alertes actives trouvées`);

        const results = [];
        for (const alert of activeAlerts) {
            // Vérifier si l'alerte doit être traitée selon sa fréquence
            if (this.shouldProcessAlert(alert)) {
                const result = await this.processAlert(alert.id);
                results.push({ alertId: alert.id, title: alert.title, ...result });
                
                // Pause entre les alertes pour éviter de surcharger les APIs
                await this.delay(2000);
            }
        }

        console.log('✅ Traitement terminé');
        return results;
    }

    // Vérifier si une alerte doit être traitée
    shouldProcessAlert(alert) {
        if (!alert.lastCheck) return true;

        const now = new Date();
        const lastCheck = new Date(alert.lastCheck);
        const hoursSinceLastCheck = (now - lastCheck) / (1000 * 60 * 60);

        switch (alert.frequency) {
            case 'daily':
                return hoursSinceLastCheck >= 24;
            case 'weekly':
                return hoursSinceLastCheck >= 168; // 7 jours
            default:
                return hoursSinceLastCheck >= 24;
        }
    }

    // Mettre à jour la date de dernière vérification
    async updateLastCheck(alertId) {
        await prisma.jobAlert.update({
            where: { id: alertId },
            data: { lastCheck: new Date() }
        });
    }

    // Nettoyer les anciennes offres
    async cleanOldOffers(userId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await prisma.jobOffer.deleteMany({
            where: {
                userId,
                createdAt: { lt: thirtyDaysAgo },
                isSaved: false // Garder les offres sauvegardées
            }
        });
    }

    // Utilitaire pour pause
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Obtenir les statistiques
    async getProcessingStats() {
        const stats = await prisma.jobOffer.groupBy({
            by: ['source'],
            _count: { _all: true },
            _avg: { matchScore: true }
        });

        const totalOffers = await prisma.jobOffer.count();
        const totalAlerts = await prisma.jobAlert.count({ where: { active: true } });

        return {
            totalOffers,
            totalAlerts,
            apiStatus: jobSearchService.getApiStatus(),
            sourceStats: stats
        };
    }
}

module.exports = new AlertProcessor();