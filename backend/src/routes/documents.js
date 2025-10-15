const express = require('express');
const {
    generateCV,
    generateCoverLetter,
    downloadDocument,
    getDocuments,
    getTemplates,
    testAIConnection,
    deleteDocument
} = require('../controllers/documentController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes principales
router.get('/', getDocuments);
router.get('/templates', getTemplates);
router.get('/test-ai', testAIConnection);
router.get('/download/:id', downloadDocument);

router.post('/cv', generateCV);
router.post('/cover-letter', generateCoverLetter);

router.delete('/:id', deleteDocument);

module.exports = router;