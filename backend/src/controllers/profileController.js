const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getProfile = async (req, res) => {
    try {
        let profile = await prisma.userProfile.findFirst({
            where: { userId: req.userId },
            include: { user: true }
        });

        if (!profile) {
            profile = await prisma.userProfile.create({
                data: {
                    userId: req.userId,
                    experiences: [],
                    education: [],
                    skills: [],
                    languages: [],
                    hobbies: []
                },
                include: { user: true }
            });
        }

        res.json({ profile });

    } catch (error) {
        console.error("Erreur récupération profil:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du profil" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const {
            phone,
            address,
            linkedin,
            github,
            website,
            summary,
            experiences,
            education,
            skills,
            languages,
            hobbies
        } = req.body;

        let profile = await prisma.userProfile.findFirst({
            where: { userId: req.userId }
        });

        if (profile) {
            profile = await prisma.userProfile.update({
                where: { id: profile.id },
                data: {
                    phone,
                    address,
                    linkedin,
                    github,
                    website,
                    summary,
                    experiences: experiences || [],
                    education: education || [],
                    skills: skills || [],
                    languages: languages || [],
                    hobbies: hobbies || []
                },
                include: { user: true }
            });
        } else {
            profile = await prisma.userProfile.create({
                data: {
                    userId: req.userId,
                    phone,
                    address,
                    linkedin,
                    github,
                    website,
                    summary,
                    experiences: experiences || [],
                    education: education || [],
                    skills: skills || [],
                    languages: languages || [],
                    hobbies: hobbies || []
                },
                include: { user: true }
            });
        }

        res.json({
            message: "Profil mis à jour avec succès",
            profile
        });

    } catch (error) {
        console.error("Erreur mise à jour profil:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du profil" });
    }
};

module.exports = {
    getProfile,
    updateProfile
};