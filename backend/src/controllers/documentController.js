const { PrismaClient } = require("@prisma/client");
const documentGenerator = require('../services/documentGeneratorService');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Test de connexion IA gratuite
const testAIConnection = async (req, res) => {
    try {
        console.log('🔧 Test IA connection called by user:', req.userId);
        const result = await documentGenerator.testHuggingFaceConnection();
        
        res.json({
            provider: 'Hugging Face (GRATUIT)',
            ...result
        });
    } catch (error) {
        console.error('❌ Error in testAIConnection:', error);
        res.status(500).json({ error: 'Erreur test connexion IA', details: error.message });
    }
};

// Lister les documents - 🔧 AVEC GESTION D'ERREURS AMÉLIORÉE
const getDocuments = async (req, res) => {
    try {
        console.log('📄 getDocuments called by user:', req.userId);
        
        // Vérifier si userId existe (du middleware auth)
        if (!req.userId) {
            console.error('❌ No userId found in request');
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { type } = req.query;
        
        const filters = { userId: req.userId };
        if (type) filters.type = type;

        console.log('🔍 Searching documents with filters:', filters);

        const documents = await prisma.generatedDocument.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                filename: true,
                template: true,
                createdAt: true,
                options: true
            }
        });

        console.log(`✅ Found ${documents.length} documents for user ${req.userId}`);
        
        res.json({ 
            documents,
            count: documents.length,
            userId: req.userId // Pour debug
        });

    } catch (error) {
        console.error("❌ Error in getDocuments:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: "Erreur lors de la récupération des documents",
            details: error.message,
            userId: req.userId || 'undefined'
        });
    }
};

// Générer un CV
const generateCV = async (req, res) => {
    try {
        console.log('🤖 generateCV called by user:', req.userId);
        
        const { templateId, options = {} } = req.body;
        
        const userProfile = await prisma.userProfile.findFirst({
            where: { userId: req.userId },
            include: { user: true }
        });

        if (!userProfile) {
            return res.status(404).json({
                error: "Profil utilisateur non trouvé. Veuillez d'abord créer votre profil."
            });
        }

        const enrichedProfile = {
            ...userProfile,
            name: userProfile.user.name,
            email: userProfile.user.email,
            id: req.userId
        };

        const result = await documentGenerator.generateCV(enrichedProfile, {
            style: templateId || 'simple',
            ...options
        });

        if (!result.success) {
            return res.status(500).json({
                error: "Erreur lors de la génération du CV",
                details: result.error
            });
        }

        const document = await prisma.generatedDocument.create({
            data: {
                type: 'cv',
                filename: result.filename,
                filePath: result.path,
                latexSource: result.latexSource,
                template: templateId || 'simple',
                options: { ...options, provider: 'huggingface' },
                userId: req.userId,
                userProfileId: userProfile.id
            }
        });

        res.json({
            message: 'CV généré avec succès (IA gratuite)',
            document: {
                id: document.id,
                filename: document.filename,
                downloadUrl: `/api/documents/download/${document.id}`,
                provider: 'Hugging Face (GRATUIT)'
            }
        });

    } catch (error) {
        console.error("❌ Error in generateCV:", error);
        res.status(500).json({ 
            error: "Erreur lors de la génération du CV",
            details: error.message
        });
    }
};

// Générer une lettre de motivation
const generateCoverLetter = async (req, res) => {
    try {
        console.log('📝 generateCoverLetter called by user:', req.userId);
        
        const { jobOfferId, options = {} } = req.body;
        
        const userProfile = await prisma.userProfile.findFirst({
            where: { userId: req.userId },
            include: { user: true }
        });

        if (!userProfile) {
            return res.status(404).json({
                error: "Profil utilisateur non trouvé"
            });
        }

        const jobOffer = await prisma.jobOffer.findFirst({
            where: { id: jobOfferId, userId: req.userId }
        });

        if (!jobOffer) {
            return res.status(404).json({
                error: "Offre d'emploi non trouvée"
            });
        }

        const enrichedProfile = {
            ...userProfile,
            name: userProfile.user.name,
            email: userProfile.user.email,
            id: req.userId
        };

        const result = await documentGenerator.generateCoverLetter(
            enrichedProfile, 
            jobOffer, 
            options
        );

        if (!result.success) {
            return res.status(500).json({
                error: "Erreur lors de la génération de la lettre",
                details: result.error
            });
        }

        const document = await prisma.generatedDocument.create({
            data: {
                type: 'cover_letter',
                filename: result.filename,
                filePath: result.path,
                latexSource: result.latexSource,
                template: 'standard',
                options: { ...options, provider: 'huggingface' },
                userId: req.userId,
                userProfileId: userProfile.id,
                jobOfferId
            }
        });

        res.json({
            message: 'Lettre de motivation générée avec succès',
            document: {
                id: document.id,
                filename: document.filename,
                downloadUrl: `/api/documents/download/${document.id}`
            }
        });

    } catch (error) {
        console.error("❌ Error in generateCoverLetter:", error);
        res.status(500).json({ 
            error: "Erreur lors de la génération de la lettre",
            details: error.message
        });
    }
};

// Télécharger un document
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await prisma.generatedDocument.findFirst({
            where: { id, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ error: "Document non trouvé" });
        }

        const filePath = document.filePath;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Fichier non trouvé sur le serveur" });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Erreur téléchargement:", error);
        res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
};

// Obtenir les templates
const getTemplates = async (req, res) => {
    try {
        console.log('📋 getTemplates called by user:', req.userId);
        const templates = documentGenerator.getAvailableTemplates();
        res.json({ templates });
    } catch (error) {
        console.error("❌ Error in getTemplates:", error);
        res.status(500).json({ 
            error: "Erreur lors de la récupération des templates",
            details: error.message
        });
    }
};

// Supprimer un document
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await prisma.generatedDocument.findFirst({
            where: { id, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ error: "Document non trouvé" });
        }

        try {
            if (fs.existsSync(document.filePath)) {
                fs.unlinkSync(document.filePath);
            }
        } catch (error) {
            console.error("Erreur suppression fichier:", error);
        }

        await prisma.generatedDocument.delete({
            where: { id }
        });

        res.json({ message: "Document supprimé avec succès" });

    } catch (error) {
        console.error("Erreur suppression document:", error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};

module.exports = {
    generateCV,
    generateCoverLetter,
    downloadDocument,
    getDocuments,
    getTemplates,
    testAIConnection,
    deleteDocument
};