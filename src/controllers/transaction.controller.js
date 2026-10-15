const Transaction = require('../models/transaction.model');

// Foydalanuvchining o'z pul tarixi (oxirgilari birinchi)
exports.getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin uchun — barcha foydalanuvchilarning tranzaksiyalari
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(200)
            .populate('user', 'username email');

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
