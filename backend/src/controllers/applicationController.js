const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Récupérer toutes les candidatures
const getApplications = async (req, res) => {
    try {
        const { status, type, search } = req.query;
        
        const filters = {
            userId: req.userId
        };
        
        if (status) {
            filters.status = status;
        }
        if (type) {
            filters.type = type;
        }
        if (search) {
            filters.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } }
            ];
        }

        const applications = await prisma.application.findMany({
            where: filters,
            orderBy: { applicationDate: 'desc' }
        });

        res.json({
            applications,
            count: applications.length
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des candidatures :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des candidatures" });
    }
};

// Créer une nouvelle candidature
const createApplication = async (req, res) => {
    try {
        const { 
            title, company, type, status, applicationDate, 
            interviewDate, notes, contactEmail, contactPhone, 
            jobUrl, salary, location, followUpDate 
        } = req.body;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                error: "Le titre du poste est requis"
            });
        }

        if (!company || company.trim() === '') {
            return res.status(400).json({
                error: "Le nom de l'entreprise est requis"
            });
        }

        // Validation du type
        const validTypes = ['stage', 'emploi'];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({
                error: "Type invalide. Les valeurs autorisées sont : 'stage', 'emploi'"
            });
        }

        // Validation du statut
        const validStatuses = ['applied', 'interview', 'rejected', 'accepted'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Statut invalide. Les valeurs autorisées sont : 'applied', 'interview', 'rejected', 'accepted'"
            });
        }

        const application = await prisma.application.create({
            data: {
                title: title.trim(),
                company: company.trim(),
                type,
                status: status || 'applied',
                applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
                interviewDate: interviewDate ? new Date(interviewDate) : null,
                notes: notes?.trim() || null,
                contactEmail: contactEmail?.trim() || null,
                contactPhone: contactPhone?.trim() || null,
                jobUrl: jobUrl?.trim() || null,
                salary: salary?.trim() || null,
                location: location?.trim() || null,
                followUpDate: followUpDate ? new Date(followUpDate) : null,
                userId: req.userId
            }
        });

        res.status(201).json({
            message: 'Candidature créée avec succès',
            application
        });
    } catch (error) {
        console.error("Erreur lors de la création de la candidature :", error);
        res.status(500).json({ error: "Erreur lors de la création de la candidature" });
    }
};

// Mettre à jour une candidature
const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Vérifier que la candidature existe et appartient à l'utilisateur
        const existingApplication = await prisma.application.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingApplication) {
            return res.status(404).json({
                error: "Candidature non trouvée"
            });
        }

        // Construire l'objet de mise à jour
        const cleanUpdateData = {};
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                if (['applicationDate', 'interviewDate', 'followUpDate'].includes(key)) {
                    cleanUpdateData[key] = updateData[key] ? new Date(updateData[key]) : null;
                } else if (typeof updateData[key] === 'string') {
                    cleanUpdateData[key] = updateData[key].trim() || null;
                } else {
                    cleanUpdateData[key] = updateData[key];
                }
            }
        });

        const application = await prisma.application.update({
            where: { id },
            data: cleanUpdateData
        });

        res.json({
            message: "Candidature mise à jour avec succès",
            application
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la candidature :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de la candidature" });
    }
};

// Supprimer une candidature
const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const existingApplication = await prisma.application.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingApplication) {
            return res.status(404).json({
                error: "Candidature non trouvée"
            });
        }

        await prisma.application.delete({
            where: { id }
        });

        res.json({
            message: "Candidature supprimée avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de la candidature :", error);
        res.status(500).json({ error: "Erreur lors de la suppression de la candidature" });
    }
};

// Statistiques des candidatures
const getApplicationStats = async (req, res) => {
    try {
        const stats = await prisma.application.groupBy({
            by: ['status'],
            where: {
                userId: req.userId
            },
            _count: true
        });

        const typeStats = await prisma.application.groupBy({
            by: ['type'],
            where: {
                userId: req.userId
            },
            _count: true
        });

        const formattedStats = {
            applied: 0,
            interview: 0,
            rejected: 0,
            accepted: 0,
            total: 0,
            stage: 0,
            emploi: 0
        };

        stats.forEach(stat => {
            formattedStats[stat.status] = stat._count;
            formattedStats.total += stat._count;
        });

        typeStats.forEach(stat => {
            formattedStats[stat.type] = stat._count;
        });

        res.json({ stats: formattedStats });
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
    }
};

module.exports = {
    getApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplicationStats
};