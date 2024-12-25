const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key';

function generateToken(user) {
    return jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

    function verifyToken(req, res, next) {
        
        
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
        if (!token) {
            return res.status(403).json({ error: 'No token provided.' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Failed to authenticate token.' });
            }

            req.user = decoded;
            next();
        });
    }

module.exports = {
    generateToken,
    verifyToken,
};
