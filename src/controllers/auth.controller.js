const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Bunday email yoki username allaqachon mavjud!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            wallet: 0
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", user: userResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }

        // Parolni tekshirish (o'zingizdagi bcrypt mantiq)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Parol noto'g'ri!" });
        }

        // Access Token (15 minut) va Refresh Token (7 kun) yaratamiz
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret_key",
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_SECRET || "refresh_secret_key",
            { expiresIn: "7d" }
        );

        // Refresh tokenni bazada userga saqlaymiz
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Muvaffaqiyatli kirdingiz!",
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token berilmadi!" });
        }

        // Bazadan shu refresh token bor-yo'qligini qidiramiz
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: "Yaroqsiz refresh token!" });
        }

        // Tokenni tekshiramiz
        jwt.verify(refreshToken, process.env.REFRESH_SECRET || "refresh_secret_key", (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Refresh token muddati tugagan!" });
            }

            // Yangi Access Token yaratamiz
            const newAccessToken = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || "secret_key",
                { expiresIn: "15m" }
            );

            res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};