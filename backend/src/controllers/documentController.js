const { PrismaClient } = require("@prisma/client");
const documentGenerator = require('../services/documentGeneratorService');
const fs = require('fs');

const prisma = new PrismaClient();

const testAIConnection = async (req, res) => {
    try {
        console.log('🔧 Test connexion IA Hugging Face...');
        const result = await documentGenerator.testAIConnection();
        
        res.json({
            ...result,
            provider: 'Hugging Face'
        });
    } catch (error) {
        console.error('❌ Erreur test IA:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur test connexion IA',
            details: error.message,
            provider: 'Hugging Face'
        });
    }
};

const generateCV = async (req, res) => {
    try {
        console.log('📄 Génération CV pour utilisateur:', req.userId);
        
        const { templateId, options = {} } = req.body;
        
        const userProfile = await prisma.userProfile.findFirst({
            where: { userId: req.userId },
            include: { user: true }
        });

        if (!userProfile) {
            return res.status(404).json({
                error: "Profil utilisateur non trouvé. Créez d'abord votre profil."
            });
        }

        const result = await documentGenerator.generateCV(userProfile, {
            style: templateId || 'modern',
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
                template: templateId || 'modern',
                options: { ...options, provider: 'latex_template' },
                userId: req.userId,
                userProfileId: userProfile.id
            }
        });

        res.json({
            message: 'CV généré avec succès',
            document: {
                id: document.id,
                filename: document.filename,
                downloadUrl: `/api/documents/download/${document.id}`,
                provider: 'Template LaTeX'
            }
        });

    } catch (error) {
        console.error("❌ Erreur génération CV:", error);
        res.status(500).json({
            error: "Erreur lors de la génération du CV",
            details: error.message
        });
    }
};

const generateCoverLetter = async (req, res) => {
    try {
        console.log('📝 Génération lettre pour utilisateur:', req.userId);
        
        const { jobOffer, options = {} } = req.body;
        
        const userProfile = await prisma.userProfile.findFirst({
            where: { userId: req.userId },
            include: { user: true }
        });

        if (!userProfile) {
            return res.status(404).json({
                error: "Profil utilisateur non trouvé. Créez d'abord votre profil."
            });
        }

        if (!jobOffer || !jobOffer.title || !jobOffer.company) {
            return res.status(400).json({
                error: "Informations de l'offre incomplètes (titre et entreprise requis)"
            });
        }

        const result = await documentGenerator.generateCoverLetter(
            userProfile,
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
                template: result.aiGenerated ? 'ai_enhanced' : 'standard_template',
                options: { 
                    ...options, 
                    aiGenerated: result.aiGenerated,
                    provider: result.aiGenerated ? 'huggingface' : 'latex_template'
                },
                userId: req.userId,
                userProfileId: userProfile.id
            }
        });

        const method = result.aiGenerated ? 'avec IA Hugging Face' : 'avec template';
        res.json({
            message: `Lettre générée avec succès ${method}`,
            document: {
                id: document.id,
                filename: document.filename,
                downloadUrl: `/api/documents/download/${document.id}`,
                aiGenerated: result.aiGenerated,
                provider: result.aiGenerated ? 'IA Hugging Face' : 'Template LaTeX'
            }
        });

    } catch (error) {
        console.error("❌ Erreur génération lettre:", error);
        res.status(500).json({
            error: "Erreur lors de la génération de la lettre",
            details: error.message
        });
    }
};

const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.generatedDocument.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ documents });
    } catch (error) {
        console.error("❌ Erreur récupération documents:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des documents" });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await prisma.generatedDocument.findFirst({
            where: { id, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ error: "Document non trouvé" });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ error: "Fichier non trouvé" });
        }

        res.download(document.filePath, document.filename);
    } catch (error) {
        console.error("❌ Erreur téléchargement:", error);
        res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await prisma.generatedDocument.findFirst({
            where: { id, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ error: "Document non trouvé" });
        }

        // Supprimer le fichier
        try {
            if (fs.existsSync(document.filePath)) {
                fs.unlinkSync(document.filePath);
            }
        } catch (error) {
            console.error("Erreur suppression fichier:", error);
        }

        // Supprimer l'enregistrement
        await prisma.generatedDocument.delete({
            where: { id }
        });

        res.json({ message: "Document supprimé avec succès" });
    } catch (error) {
        console.error("❌ Erreur suppression:", error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};

const getTemplates = async (req, res) => {
    try {
        const templates = documentGenerator.getAvailableTemplates();
        res.json({ templates });
    } catch (error) {
        console.error("❌ Erreur templates:", error);
        res.status(500).json({
            error: "Erreur récupération templates",
            details: error.message
        });
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