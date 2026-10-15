const User = require('../models/user.model');
const Skin = require('../models/skins.model');
const Inventory = require('../models/inventory.model');
const Transaction = require('../models/transaction.model');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User topilmadi" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { role, wallet, password, ...allowedData } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(req.params.id, allowedData, { 
            new: true, 
            runValidators: true 
        }).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User topilmadi" });
        res.status(200).json({ message: "Ma'lumotlar yangilandi", user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User topilmadi" });
        res.status(200).json({ message: "User o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Inventarni ko'rish funksiyasi (faqat egasidagi, hali sotilmaganlar)
exports.getMyInventory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }

        const inventory = await Inventory.find({ user: req.user.id, status: 'owned' })
            .populate('skin')
            .sort({ obtainedAt: -1 });

        res.status(200).json({
            success: true,
            wallet: user.wallet, // Hamyon balansini ham ko'rsatib ketish qulayroq bo'ladi
            count: inventory.length,
            inventory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Skin sotib olish funksiyasi
exports.buySkin = async (req, res) => {
    try {
        const { skinId } = req.params;
        const userId = req.user.id;

        const skin = await Skin.findById(skinId);
        if (!skin) {
            return res.status(404).json({ message: "Skin topilmadi!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }

        // skin.price o'rniga skin.skinPrice ishlatiladi
        if (user.wallet < skin.skinPrice) {
            return res.status(400).json({ message: "Balansingizda yetarli mablag' yo'q!" });
        }

        const balanceBefore = user.wallet;
        user.wallet -= skin.skinPrice;
        const balanceAfter = user.wallet;

        await user.save();

        // Inventarga yozamiz (marketplace'dan sotib olindi — kesadan tushmagan)
        const item = await Inventory.create({
            user: user._id,
            skin: skin._id,
            sourceCase: null,
            status: 'owned'
        });

        // Pul tarixini yozamiz
        await Transaction.create({
            user: user._id,
            type: 'skin_buy',
            amount: -skin.skinPrice,
            balanceBefore,
            balanceAfter
        });

        res.status(200).json({
            message: "Skin muvaffaqiyatli sotib olindi!",
            wallet: user.wallet,
            item
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Skinni sotish funksiyasi
exports.sellSkin = async (req, res) => {
    try {
        const { skinId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }

        // Egasidagi bitta nusxani topamiz (owned holatdagi)
        const item = await Inventory.findOne({ user: userId, skin: skinId, status: 'owned' });
        if (!item) {
            return res.status(400).json({ message: "Sizda bu skin mavjud emas!" });
        }

        const skin = await Skin.findById(skinId);
        if (!skin) {
            return res.status(404).json({ message: "Skin topilmadi!" });
        }

        const balanceBefore = user.wallet;
        user.wallet += skin.skinPrice;
        const balanceAfter = user.wallet;

        // Inventardan o'chirmaymiz — 'sold' holatga o'tkazib, tarixni saqlaymiz
        item.status = 'sold';
        await item.save();
        await user.save();

        // Pul tarixini yozamiz
        await Transaction.create({
            user: user._id,
            type: 'skin_sale',
            amount: skin.skinPrice,
            balanceBefore,
            balanceAfter
        });

        res.status(200).json({
            message: "Skin muvaffaqiyatli sotildi!",
            wallet: user.wallet,
            soldItem: item
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Foydalanuvchi o'z hamyoniga pul qo'shishi (balansni to'ldirishi)
exports.depositMoney = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Iltimos, to'g'ri miqdor kiriting!" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }

        const balanceBefore = user.wallet;
        user.wallet += Number(amount);
        const balanceAfter = user.wallet;
        await user.save();

        // Pul tarixini yozamiz
        await Transaction.create({
            user: user._id,
            type: 'deposit',
            amount: Number(amount),
            balanceBefore,
            balanceAfter
        });

        res.status(200).json({
            message: "Balans muvaffaqiyatli to'ldirildi!",
            wallet: user.wallet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};