const { Router } = require('express');
const { register, login, getMe,  refreshToken } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth'); // Mana shu qator borligini tekshiring

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe); 
router.post("/refresh", refreshToken);

module.exports = router;