const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Generer un token JWT
const generateToken = (userId, email) =>
{
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Le token expire dans 7 jours
    );
};

// Inscription d'un nouvel utilisateur
const register = async (req, res) =>
{
    try
    {
        const { email, password, name } = req.body;

        //validation des champs 
        if (!email || !password || !name) 
        {
            return res.status(400).json({
                error : "Tous les champs sont requis"
            });
        }

        // Vérifier si l'email existe deja
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser)
        {
            return res.status(400).json({
                error: 'Email déjà utilisé'
            });
        }
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });

        // générer un token
        const token = generateToken(newUser.id, newUser.email);

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: newUser,
            token
        });
    }
    catch (error)
    {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({
            error: 'Erreur serveur'
        });
    }
};

// Connexion d'un utilisateur existant  
const login = async (req, res) => {
    try
    {
        const { email, password } = req.body;

        //validation des champs
        if (!email || !password)
        {
            return res.status(400).json({
                error: "Tous les champs sont requis"
            });
        }
        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user)
        {
            return res.status(400).json({
                error: 'Email ou mot de passe incorrect'
            });
        }

        //verifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
        {
            return res.status(400).json({
                error: 'Email ou mot de passe incorrect'
            });
        }

        // generer le token
        const token = generateToken(user.id, user.email);

        res.json({
            message: 'Connexion réussie',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });
    }
    catch (error)
    {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({
            error: 'Erreur lors de la connexion'

        });
    }
};

// Recuperer le profil
const getProfile = async (req, res) => {
    try
    {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                _count: {
                    select : {tasks: true}
                }
            }
        });
        
        if (!user)
        {
            return res.status(404).json({
                error: 'Utilisateur non trouvé'
            });
        }
        res.json({ user });
    }
    catch (error)
    {
        console.error("Erreur lors de la récupération du profil :", error);
        res.status(500).json({
            error: 'Erreur lors de la recuperation du profil'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile
};