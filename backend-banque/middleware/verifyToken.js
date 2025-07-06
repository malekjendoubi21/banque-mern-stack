const jwt = require('jsonwebtoken');
const SECRET =  'ton_jwt_secret';

module.exports = (allowedUserTypes = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(403).json({ message: 'Token requis' });

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) return res.status(403).json({ message: 'Token manquant' });

        try {
            const decoded = jwt.verify(token, SECRET);

            if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(decoded.userType)) {
                return res.status(403).json({ message: 'Accès refusé' });
            }

            req.user = decoded; // { id, userType }
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
    };
};
