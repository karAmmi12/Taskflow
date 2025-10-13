const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try
    {
        // recuperer le token du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer '))
        {
            return res.status(401).json({
                error: "Token manquant ou mal formaté"
            });
        }

        //extraire le token
        const token = authHeader.split(' ')[1];

        //verifier le token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        //ajouter les infos utilisateur a la requete
        req.userId = decodedToken.userId;
        req.userEmail = decodedToken.email;

        //passer au middleware suivant
        next();
    } catch (error)
    {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalide' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expiré' });
        }
        return res.status(500).json({ error: "Erreur d\'authentification" });
    }
};

module.exports = authMiddleware;