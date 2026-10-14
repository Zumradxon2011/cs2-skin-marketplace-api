const { Router } = require("express");
const {
    getAllUsers,    
    getUserById,    
    updateUser,
    deleteUser,
    getMyInventory,
    buySkin,
    sellSkin,
    depositMoney
} = require("../controllers/user.controller");

const { updateUserSchema } = require("../validations/user.validation");
const validate = require("../middlewares/validate");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");


const router = Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers);        
router.get("/inventory", authMiddleware, getMyInventory);      
router.post("/buy/:skinId", authMiddleware, buySkin);      // <--- Yangi qo'shildi
router.post("/sell/:skinId", authMiddleware, sellSkin);    // <--- Yangi qo'shildi
router.get("/:id", authMiddleware, getUserById);      
router.patch("/:id", authMiddleware, validate(updateUserSchema), updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);
router.post("/deposit", authMiddleware, depositMoney);
module.exports = router;