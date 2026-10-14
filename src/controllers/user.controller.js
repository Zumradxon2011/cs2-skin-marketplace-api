const User = require('../models/user.model');
const Skin = require('../models/skins.model');

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

// Inventarni ko'rish funksiyasi
exports.getMyInventory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('skins');
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }
        res.status(200).json({
            success: true,
            wallet: user.wallet, // Hamyon balansini ham ko'rsatib ketish qulayroq bo'ladi
            skins: user.skins
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

        user.wallet -= skin.skinPrice;
        user.skins.push(skin._id);

        await user.save();

        res.status(200).json({
            message: "Skin muvaffaqiyatli sotib olindi!",
            wallet: user.wallet,
            skins: user.skins
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

        const skinIndex = user.skins.indexOf(skinId);
        if (skinIndex === -1) {
            return res.status(400).json({ message: "Sizda bu skin mavjud emas!" });
        }

        const skin = await Skin.findById(skinId);
        if (!skin) {
            return res.status(404).json({ message: "Skin topilmadi!" });
        }

        user.skins.splice(skinIndex, 1);
        // skin.price o'rniga skin.skinPrice ishlatiladi
        user.wallet += skin.skinPrice;

        await user.save();

        res.status(200).json({
            message: "Skin muvaffaqiyatli sotildi!",
            wallet: user.wallet,
            skins: user.skins
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

        user.wallet += Number(amount);
        await user.save();

        res.status(200).json({
            message: "Balans muvaffaqiyatli to'ldirildi!",
            wallet: user.wallet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};