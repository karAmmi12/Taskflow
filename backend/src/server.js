require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors()); //activer CORS pour toutes les routes
app.use(express.json()); //pour parser le corps des requêtes en JSON
app.use(express.urlencoded({ extended: true })); //pour parser les données URL-encodées

// Test route
app.get("/",  (req, res) => {
    res.json({
        message: "Bienvenue sur l'API TaskFlow",
        version: "1.0.0",
        database: "PostgreSQL avec Prisma ORM"
    });
});

// Route Health Check
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            status: "ERROR",
            database: "disconnected",
            error: error.message
        });
    }
});

//Routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const applicationRoutes = require("./routes/applications");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/applications", applicationRoutes);

// fermeture de la connexion à la base de données lors de l'arrêt du serveur    
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

//Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(` Database: PostgreSQL with Prisma`);
})