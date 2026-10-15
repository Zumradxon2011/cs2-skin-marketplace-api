const Skin = require('../models/skins.model');
const fs = require('fs');
const path = require('path');

// Lokal (/uploads/) rasmni o'chirishga yordamchi.
// Masofaviy URL (https://...) bo'lsa — unga tegilmaydi!
const removeLocalImage = (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
        return;
    }

    const imagePath = path.join(__dirname, '../../', imageUrl);
    if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Rasmni o'chirishda xatolik:", err);
        });
    }
};

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

// Yangi skin yaratish (2 usul: fayl upload YOKI imageUrl havolasi)
exports.createSkin = async (req, res) => {
    try {
        const skinData = { ...req.body };

        if (req.file) {
            // 1-usul: fayl yuklandi (multipart/form-data, maydon nomi 'image')
            skinData.imageUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.imageUrl) {
            // 2-usul: tayyor havola — validate allaqachon http/https tekshirdi
            skinData.imageUrl = req.body.imageUrl;
        } else {
            return res.status(400).json({ message: "Rasm kerak: fayl ('image') YOKI 'imageUrl' havolasi!" });
        }

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

        // Yangi fayl yuklangan bo'lsa — eskisini (lokal fayl bo'lsa) o'chiramiz
        if (req.file) {
            removeLocalImage(skin.imageUrl);
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.imageUrl) {
            // Yangi havola berilgan bo'lsa — eskisi lokal fayl bo'lsa uni tozalaymiz
            removeLocalImage(skin.imageUrl);
            updateData.imageUrl = req.body.imageUrl;
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

        // Bazadan o'chgandan keyin uning lokal rasmini ham serverdan o'chiramiz
        removeLocalImage(deletedSkin.imageUrl);

        res.status(200).json({ message: "Skin muvaffaqiyatli o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: "Skinni o'chirishda xatolik yuz berdi", error: error.message });
    }
};
