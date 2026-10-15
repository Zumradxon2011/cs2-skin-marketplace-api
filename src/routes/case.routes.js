const { Router } = require("express");
const {
    getAllCases,
    getCaseById,
    createCase,
    updateCase,
    deleteCase,
    openCase
} = require("../controllers/case.controller");

const { caseSchema, updateCaseSchema, parseCaseBody } = require("../validations/case.validation");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = Router();

// Ochiq yo'llar (hamma ko'ra oladi)
router.get("/", getAllCases);
router.get("/:id", getCaseById);

// ⭐ Kesa ochish — faqat login bo'lgan foydalanuvchi
router.post("/:id/open", authMiddleware, openCase);

// Himoyalangan va Admin uchun yo'llar
router.post("/", authMiddleware, adminMiddleware, upload.single('image'), parseCaseBody, validate(caseSchema), createCase);
router.patch("/:id", authMiddleware, adminMiddleware, upload.single('image'), parseCaseBody, validate(updateCaseSchema), updateCase);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCase);

module.exports = router;
