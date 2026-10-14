const { Router } = require("express");
const {
    getAllSkins,
    getSkinById,
    createSkin,
    updateSkin,
    deleteSkin
} = require("../controllers/skins.controller"); // Fayl nomini tekshiring

const { skinSchema, updateSkinSchema } = require("../validations/skin.validation");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = Router();

// Ochiq yo'llar (hamma ko'ra oladi)
router.get("/", getAllSkins);
router.get("/:id", getSkinById);

// Himoyalangan va Admin uchun yo'llar
router.post("/", authMiddleware, adminMiddleware, upload.single('image'), validate(skinSchema), createSkin);
router.patch("/:id", authMiddleware, adminMiddleware, upload.single('image'), validate(updateSkinSchema), updateSkin);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSkin);

module.exports = router;