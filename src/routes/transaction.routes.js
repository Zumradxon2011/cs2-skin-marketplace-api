const { Router } = require('express');
const { getMyTransactions, getAllTransactions } = require('../controllers/transaction.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = Router();

// O'z pul tarixi (login talab qilinadi)
router.get('/', authMiddleware, getMyTransactions);

// Barcha tranzaksiyalar (faqat admin)
router.get('/all', authMiddleware, adminMiddleware, getAllTransactions);

module.exports = router;
