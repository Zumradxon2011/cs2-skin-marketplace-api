const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Token topilmadi yoki avtorizatsiyadan o'tmagansiz!" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Yaroqsiz yoki muddati o'tgan token!" });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Avtorizatsiyadan o'tmagansiz!" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Sizda bu amalni bajarish uchun huquq yo'q (Faqat adminlar uchun)!" });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };