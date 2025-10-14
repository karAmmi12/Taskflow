const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Récupérer toutes les alertes
const getJobAlerts = async (req, res) => {
    try {
        const { active } = req.query;
        
        const filters = {
            userId: req.userId
        };
        
        if (active !== undefined) {
            filters.active = active === 'true';
        }

        const jobAlerts = await prisma.jobAlert.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            jobAlerts,
            count: jobAlerts.length
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des alertes :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des alertes" });
    }
};

// Créer une nouvelle alerte
const createJobAlert = async (req, res) => {
    try {
        const { 
            title, keywords, location, company, 
            salary, contract, frequency 
        } = req.body;

        // 🔍 DEBUG - Logs détaillés
        console.log('📋 === CRÉATION ALERTE DEBUG ===');
        console.log('📋 Body complet reçu:', JSON.stringify(req.body, null, 2));
        console.log('📋 Keywords reçus:', {
            value: keywords,
            type: typeof keywords,
            isArray: Array.isArray(keywords),
            length: keywords?.length
        });

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                error: "Le titre de l'alerte est requis"
            });
        }

        // ⚠️ Validation des mots-clés
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({
                error: "Au moins un mot-clé est requis"
            });
        }

        const jobAlert = await prisma.jobAlert.create({
            data: {
                title: title.trim(),
                keywords: keywords.filter(k => k && k.trim()), // ✅ Filtrer les mots-clés vides
                location: location?.trim() || null,
                company: company?.trim() || null,
                salary: salary?.trim() || null,
                contract: contract?.trim() || null,
                frequency: frequency || 'daily',
                userId: req.userId
            }
        });

        // 🔍 DEBUG - Vérifier ce qui est sauvé
        console.log('✅ Alerte créée en base:', {
            id: jobAlert.id,
            title: jobAlert.title,
            keywords: jobAlert.keywords,
            keywordsCount: jobAlert.keywords.length,
            location: jobAlert.location
        });

        res.status(201).json({
            message: 'Alerte créée avec succès',
            jobAlert
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'alerte :", error);
        res.status(500).json({ error: "Erreur lors de la création de l'alerte" });
    }
};

// Mettre à jour une alerte
const updateJobAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Vérifier que l'alerte existe et appartient à l'utilisateur
        const existingAlert = await prisma.jobAlert.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingAlert) {
            return res.status(404).json({
                error: "Alerte non trouvée"
            });
        }

        // Nettoyer les données
        const cleanData = {};
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                if (typeof updateData[key] === 'string') {
                    cleanData[key] = updateData[key].trim() || null;
                } else {
                    cleanData[key] = updateData[key];
                }
            }
        });

        const updatedAlert = await prisma.jobAlert.update({
            where: { id },
            data: cleanData
        });

        res.json({
            message: "Alerte mise à jour avec succès",
            jobAlert: updatedAlert
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'alerte :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'alerte" });
    }
};

// Supprimer une alerte
const deleteJobAlert = async (req, res) => {
    try {
        const { id } = req.params;

        const existingAlert = await prisma.jobAlert.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingAlert) {
            return res.status(404).json({
                error: "Alerte non trouvée"
            });
        }

        await prisma.jobAlert.delete({
            where: { id }
        });

        res.json({
            message: "Alerte supprimée avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'alerte :", error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'alerte" });
    }
};

// Statistiques des alertes
const getJobAlertStats = async (req, res) => {
    try {
        const stats = await prisma.jobAlert.groupBy({
            by: ['active'],
            where: {
                userId: req.userId
            },
            _count: true
        });

        const formattedStats = {
            active: 0,
            inactive: 0,
            total: 0
        };

        stats.forEach(stat => {
            if (stat.active) {
                formattedStats.active = stat._count;
            } else {
                formattedStats.inactive = stat._count;
            }
            formattedStats.total += stat._count;
        });

        res.json({ stats: formattedStats });
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
    }
};

module.exports = {
    getJobAlerts,
    createJobAlert,
    updateJobAlert,
    deleteJobAlert,
    getJobAlertStats,

};