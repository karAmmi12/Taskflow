// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const {PrismaClient } = require("@prisma/client");

// const app = express();
// const prisma = new PrismaClient();

// // Middleware
// app.use(cors()); //activer CORS pour toutes les routes
// app.use(express.json()); //pour parser le corps des requêtes en JSON
// app.use(express.urlencoded({ extended: true })); //pour parser les données URL-encodées

// // Test route
// app.get("/",  (req, res) => {
//     res.json({
//         message: "Bienvenue sur l'API TaskFlow",
//         version: "1.0.0",
//         database: "PostgreSQL avec Prisma ORM"
//     });
// });

// // Route Health Check
// app.get("/health", async (req, res) => {
//     try {
//         await prisma.$queryRaw`SELECT 1`;
//         res.json({
//             status: "ok",
//             database: "connected",
//             timestamp: new Date().toISOString()
//         });
//     }
//     catch (error) {
//         res.status(500).json({
//             status: "ERROR",
//             database: "disconnected",
//             error: error.message
//         });
//     }
// });

// //Routes
// const authRoutes = require("./routes/auth");
// const taskRoutes = require("./routes/tasks");
// const applicationRoutes = require("./routes/applications");
// const jobAlertRoutes = require("./routes/jobAlerts");
// const jobOfferRoutes = require("./routes/jobOffers"); 
// const documentRoutes = require("./routes/documents");
// const profileRoutes = require("./routes/profiles");



// app.use("/api/auth", authRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/applications", applicationRoutes);
// app.use("/api/job-alerts", jobAlertRoutes); 
// app.use("/api/job-offers", jobOfferRoutes); 
// app.use("/api/documents", documentRoutes);
// app.use("/api/profiles", profileRoutes);


// // fermeture de la connexion à la base de données lors de l'arrêt du serveur    
// process.on("SIGINT", async () => {
//     await prisma.$disconnect();
//     process.exit(0);
// });

// process.on("SIGTERM", async () => {
//     await prisma.$disconnect();
//     process.exit(0);
// });

// //Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`http://localhost:${PORT}`);
//     console.log(` Database: PostgreSQL with Prisma`);
// })

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de debug
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API TaskFlow",
        version: "1.0.0",
        database: "PostgreSQL avec Prisma ORM"
    });
});

// Health Check
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            database: "disconnected",
            error: error.message
        });
    }
});

// Imports des routes avec gestion d'erreur
console.log('📝 Chargement des routes...');

try {
    const authRoutes = require("./routes/auth");
    console.log('✅ Route auth chargée');
    
    const taskRoutes = require("./routes/tasks");
    console.log('✅ Route tasks chargée');
    
    const applicationRoutes = require("./routes/applications");
    console.log('✅ Route applications chargée');
    
    const jobAlertRoutes = require("./routes/jobAlerts");
    console.log('✅ Route jobAlerts chargée');
    
    const jobOfferRoutes = require("./routes/jobOffers");
    console.log('✅ Route jobOffers chargée');
    
    // 🔧 Routes critiques avec vérification
    let documentRoutes, profileRoutes;
    
    try {
        documentRoutes = require("./routes/documents");
        console.log('✅ Route documents chargée');
    } catch (error) {
        console.error('❌ Erreur chargement route documents:', error.message);
        // Route de fallback temporaire
        documentRoutes = express.Router();
        documentRoutes.get('/', (req, res) => res.status(503).json({ error: 'Service documents non disponible' }));
    }
    
    try {
        profileRoutes = require("./routes/profiles");
        console.log('✅ Route profiles chargée');
    } catch (error) {
        console.error('❌ Erreur chargement route profiles:', error.message);
        // Route de fallback temporaire
        profileRoutes = express.Router();
        profileRoutes.get('/', (req, res) => res.status(503).json({ error: 'Service profiles non disponible' }));
    }

    // Enregistrement des routes
    app.use("/api/auth", authRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/job-alerts", jobAlertRoutes);
    app.use("/api/job-offers", jobOfferRoutes);
    app.use("/api/documents", documentRoutes);
    app.use("/api/profiles", profileRoutes);
    
    console.log('✅ Toutes les routes sont enregistrées');

} catch (error) {
    console.error('❌ Erreur critique lors du chargement des routes:', error);
}

// 🔧 CORRECTION: Route catch-all compatible Express 5
app.use('/api', (req, res) => {
    console.log(`❌ Route API non trouvée: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route API non trouvée',
        path: req.originalUrl,
        method: req.method,
        message: 'Cette route n\'existe pas dans l\'API TaskFlow',
        availableRoutes: [
            'GET  /api/',
            'GET  /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET  /api/auth/profile',
            'GET  /api/tasks',
            'POST /api/tasks',
            'GET  /api/applications',
            'POST /api/applications',
            'GET  /api/job-alerts',
            'POST /api/job-alerts',
            'GET  /api/job-offers',
            'GET  /api/documents',
            'POST /api/documents/cv',
            'GET  /api/profiles'
        ]
    });
});

// Démarrer le serveur
const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📋 Routes disponibles:`);
    console.log(`   GET  /`);
    console.log(`   GET  /health`);
    console.log(`   *    /api/auth/*`);
    console.log(`   *    /api/tasks/*`);
    console.log(`   *    /api/applications/*`);
    console.log(`   *    /api/job-alerts/*`);
    console.log(`   *    /api/job-offers/*`);
    console.log(`   *    /api/documents/*`);
    console.log(`   *    /api/profiles/*`);
});

// Fermeture propre
process.on("SIGINT", async () => {
    console.log('🛑 Arrêt du serveur...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log('🛑 Arrêt du serveur...');
    await prisma.$disconnect();
    process.exit(0);
});