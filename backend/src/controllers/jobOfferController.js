const { PrismaClient } = require("@prisma/client");
const alertProcessor = require('../services/alertProcessor');
const jobSearchService = require('../services/jobSearchService');

const prisma = new PrismaClient();

// Test de connexion ET test avec vraie alerte
jobSearchService.testAdzunaConnection().then(result => {
    console.log('🧪 Test Adzuna:', result);
    
    if (result.success) {
        // Lancer le test avec une alerte factice
        console.log('🔍 Lancement du test avec alerte factice...');
        jobSearchService.testWithRealAlert();
    }
});
jobSearchService.testFranceTravailConnection().then(result => {
    console.log('🧪 Test France Travail:', result);
});

// Récupérer les offres d'emploi de l'utilisateur
const getJobOffers = async (req, res) => {
    try {
        const { alertId, source, isRead, isSaved, minScore, limit = 50 } = req.query;
        
        const filters = {
            userId: req.userId
        };
        
        if (alertId) filters.alertId = alertId;
        if (source) filters.source = source;
        if (isRead !== undefined) filters.isRead = isRead === 'true';
        if (isSaved !== undefined) filters.isSaved = isSaved === 'true';
        if (minScore) filters.matchScore = { gte: parseInt(minScore) };

        const offers = await prisma.jobOffer.findMany({
            where: filters,
            include: {
                alert: { select: { title: true } }
            },
            orderBy: [
                { matchScore: 'desc' },
                { publishedAt: 'desc' }
            ],
            take: parseInt(limit)
        });

        res.json({
            offers: offers.map(offer => ({
                ...offer,
                alertTitle: offer.alert.title
            })),
            count: offers.length
        });
    } catch (error) {
        console.error("Erreur récupération offres :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des offres" });
    }
};

// Marquer une offre comme lue/sauvegardée/candidature envoyée
const updateJobOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead, isSaved, isApplied } = req.body;

        const offer = await prisma.jobOffer.findFirst({
            where: { id, userId: req.userId }
        });

        if (!offer) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        const updateData = {};
        if (isRead !== undefined) updateData.isRead = isRead;
        if (isSaved !== undefined) updateData.isSaved = isSaved;
        if (isApplied !== undefined) updateData.isApplied = isApplied;

        const updatedOffer = await prisma.jobOffer.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: "Statut mis à jour avec succès",
            offer: updatedOffer
        });
    } catch (error) {
        console.error("Erreur mise à jour offre :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

// Traiter manuellement une alerte
const processAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        
        // Vérifier que l'alerte appartient à l'utilisateur
        const alert = await prisma.jobAlert.findFirst({
            where: { id: alertId, userId: req.userId }
        });

        if (!alert) {
            return res.status(404).json({ error: "Alerte non trouvée" });
        }

        const result = await alertProcessor.processAlert(alertId);
        
        res.json({
            message: "Traitement terminé",
            result
        });
    } catch (error) {
        console.error("Erreur traitement alerte :", error);
        res.status(500).json({ error: "Erreur lors du traitement" });
    }
};

// Statistiques des offres
const getOfferStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Statistiques par source
        const stats = await prisma.jobOffer.groupBy({
            by: ['source'],
            where: { userId },
            _count: { _all: true },
            _avg: { matchScore: true }
        });

        // Compter les totaux
        const totalCount = await prisma.jobOffer.count({
            where: { userId }
        });

        // Compter les offres lues
        const readCount = await prisma.jobOffer.count({
            where: { 
                userId,
                isRead: true 
            }
        });

        // Compter les offres sauvegardées
        const savedCount = await prisma.jobOffer.count({
            where: { 
                userId,
                isSaved: true 
            }
        });

        // Compter les candidatures envoyées
        const appliedCount = await prisma.jobOffer.count({
            where: { 
                userId,
                isApplied: true 
            }
        });

        // Compter les offres récentes (7 derniers jours)
        const recentOffers = await prisma.jobOffer.count({
            where: {
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 jours
                }
            }
        });

        res.json({
            stats: {
                total: totalCount,
                read: readCount,
                saved: savedCount,
                applied: appliedCount,
                recentOffers,
                bySource: stats.map(s => ({
                    source: s.source,
                    count: s._count._all,
                    avgScore: Math.round(s._avg.matchScore || 0)
                })),
                apiStatus: jobSearchService.getApiStatus()
            }
        });
    } catch (error) {
        console.error("Erreur récupération statistiques :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
    }
};

// Supprimer une offre
const deleteJobOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await prisma.jobOffer.findFirst({
            where: { id, userId: req.userId }
        });

        if (!offer) {
            return res.status(404).json({ error: "Offre non trouvée" });
        }

        await prisma.jobOffer.delete({
            where: { id }
        });

        res.json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error("Erreur suppression offre :", error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};



module.exports = {
    getJobOffers,
    updateJobOfferStatus,
    processAlert,
    getOfferStats,
    deleteJobOffer
};