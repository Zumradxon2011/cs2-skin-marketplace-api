const Case = require('../models/case.model');
const User = require('../models/user.model');
const Inventory = require('../models/inventory.model');
const Transaction = require('../models/transaction.model');
const rollChance = require('../utils/rollChance');
const fs = require('fs');
const path = require('path');

// Barcha kesalarni olish
exports.getAllCases = async (req, res) => {
    try {
        const cases = await Case.find().populate('skins.skin');
        res.status(200).json(cases);
    } catch (error) {
        res.status(500).json({ message: 'Kesalarni olishda xatolik yuz berdi', error: error.message });
    }
};

// ID bo'yicha bitta kesani olish
exports.getCaseById = async (req, res) => {
    try {
        const caseDoc = await Case.findById(req.params.id).populate('skins.skin');

        if (!caseDoc) {
            return res.status(404).json({ message: "Kesa topilmadi" });
        }

        res.status(200).json(caseDoc);
    } catch (error) {
        res.status(500).json({ message: "Kesani olishda xatolik yuz berdi", error: error.message });
    }
};

// Yangi kesa yaratish (faqat admin)
exports.createCase = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Rasm yuklanishi shart!" });
        }

        const caseData = {
            ...req.body,
            imageUrl: `/uploads/${req.file.filename}`
        };

        const newCase = new Case(caseData);
        const savedCase = await newCase.save();

        res.status(201).json({
            message: "Kesa muvaffaqiyatli yaratildi",
            case: savedCase
        });
    } catch (error) {
        // Xatolik bo'lsa yuklangan faylni tozalaymiz
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Yuklangan rasmni o'chirishda xatolik:", err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Kesani yangilash (faqat admin)
exports.updateCase = async (req, res) => {
    try {
        const { id } = req.params;
        const caseDoc = await Case.findById(id);

        if (!caseDoc) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Rasmni o'chirishda xatolik:", err);
                });
            }
            return res.status(404).json({ message: "Kesa topilmadi" });
        }

        let updateData = { ...req.body };

        // Yangi rasm yuklangan bo'lsa — eskisini o'chirib, yangisini yozamiz
        if (req.file) {
            if (caseDoc.imageUrl) {
                const oldImagePath = path.join(__dirname, '../../', caseDoc.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error("Eski rasmni o'chirishda xatolik:", err);
                    });
                }
            }
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedCase = await Case.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        res.status(200).json({
            message: "Kesa muvaffaqiyatli yangilandi",
            case: updatedCase
        });
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Rasmni o'chirishda xatolik:", err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Kesani o'chirish (faqat admin)
exports.deleteCase = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCase = await Case.findByIdAndDelete(id);

        if (!deletedCase) {
            return res.status(404).json({ message: "Kesa topilmadi" });
        }

        // Bazadan o'chgandan keyin rasmini ham serverdan o'chiramiz
        if (deletedCase.imageUrl) {
            const imagePath = path.join(__dirname, '../../', deletedCase.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Rasmni o'chirishda xatolik:", err);
                });
            }
        }

        res.status(200).json({ message: "Kesa muvaffaqiyatli o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: "Kesani o'chirishda xatolik yuz berdi", error: error.message });
    }
};

// ⭐ KESANI OCHISH — asosiy o'yin mantiqi
exports.openCase = async (req, res) => {
    try {
        const caseDoc = await Case.findById(req.params.id).populate('skins.skin');

        if (!caseDoc) {
            return res.status(404).json({ message: "Kesa topilmadi!" });
        }
        if (!caseDoc.isAvailable) {
            return res.status(400).json({ message: "Bu kesa hozircha sotuvda emas!" });
        }
        if (!caseDoc.skins || caseDoc.skins.length === 0) {
            return res.status(400).json({ message: "Bu kesada skinlar mavjud emas!" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }
        if (user.wallet < caseDoc.casePrice) {
            return res.status(400).json({ message: "Balansingizda yetarli mablag' yo'q!" });
        }

        // 1) Chance bo'yicha g'olib skinni tanlaymiz
        const winner = rollChance(caseDoc.skins);
        if (!winner || !winner.skin) {
            return res.status(500).json({ message: "Kesani ochishda xatolik yuz berdi!" });
        }

        // 2) Balansdan kesa narxini yechamiz
        const balanceBefore = user.wallet;
        user.wallet -= caseDoc.casePrice;
        const balanceAfter = user.wallet;
        await user.save();

        // 3) Yutilgan skinni inventarga qo'shamiz (qaysi kesadan tushganini bilamiz)
        const item = await Inventory.create({
            user: user._id,
            skin: winner.skin._id,
            sourceCase: caseDoc._id,
            status: 'owned',
            obtainedAt: new Date()
        });

        // 4) Pul tarixini yozamiz (balanceBefore -> balanceAfter)
        await Transaction.create({
            user: user._id,
            type: 'case_open',
            amount: -caseDoc.casePrice,
            balanceBefore,
            balanceAfter
        });

        res.status(200).json({
            message: "Tabriklaymiz! Kesa ochildi",
            skin: winner.skin,
            inventoryItem: item,
            wallet: user.wallet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
