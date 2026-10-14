const Skin = require('../models/skins.model');
const fs = require('fs');
const path = require('path');

// Barcha skinlarni olish
exports.getAllSkins = async (req, res) => {
    try {
        const skins = await Skin.find();
        res.status(200).json(skins);
    } catch (error) {
        res.status(500).json({ message: 'Skinlarni olishda xatolik yuz berdi', error: error.message });
    }
};

// ID bo'yicha bitta skinni olish
exports.getSkinById = async (req, res) => {
    try {
        const { id } = req.params;
        const skin = await Skin.findById(id);

        if (!skin) {
            return res.status(404).json({ message: "Skin topilmadi" });
        }

        res.status(200).json(skin);
    } catch (error) {
        res.status(500).json({ message: "Skinni olishda xatolik yuz berdi", error: error.message });
    }
};

// Yangi skin yaratish
exports.createSkin = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Rasm yuklanishi shart!" });
        }

        const skinData = {
            ...req.body,
            imageUrl: `/uploads/${req.file.filename}`
        };

        const newSkin = new Skin(skinData);
        const savedSkin = await newSkin.save();
        
        res.status(201).json({
            message: "Skin muvaffaqiyatli yaratildi",
            skin: savedSkin
        });
    } catch (error) {
        // Agar xatolik bo'lsa va fayl yuklangan bo'lsa, uni o'chirib yuboramiz
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Yuklangan rasmni o'chirishda xatolik:", err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Skinni yangilash
exports.updateSkin = async (req, res) => {
    try {
        const { id } = req.params;
        const skin = await Skin.findById(id);

        if (!skin) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Rasmni o'chirishda xatolik:", err);
                });
            }
            return res.status(404).json({ message: "Skin topilmadi" });
        }

        let updateData = { ...req.body };

        // Agar yangi rasm yuklangan bo'lsa, eskisini o'chiramiz va yangisini yozamiz
        if (req.file) {
            if (skin.imageUrl) {
                const oldImagePath = path.join(__dirname, '../../', skin.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error("Eski rasmni o'chirishda xatolik:", err);
                    });
                }
            }
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedSkin = await Skin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        res.status(200).json({
            message: "Skin muvaffaqiyatli yangilandi",
            skin: updatedSkin
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

// Skinni o'chirish
exports.deleteSkin = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSkin = await Skin.findByIdAndDelete(id);

        if (!deletedSkin) {
            return res.status(404).json({ message: "Skin topilmadi" });
        }

        // Bazadan o'chgandan keyin uning rasmini ham serverdan o'chiramiz
        if (deletedSkin.imageUrl) {
            const imagePath = path.join(__dirname, '../../', deletedSkin.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Rasmni o'chirishda xatolik:", err);
                });
            }
        }

        res.status(200).json({ message: "Skin muvaffaqiyatli o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: "Skinni o'chirishda xatolik yuz berdi", error: error.message });
    }
};
