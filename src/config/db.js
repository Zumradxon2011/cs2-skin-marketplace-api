const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB'); 
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const createInitialAdmin = async () => {
    try {
        // Bazada admin bor-yo'qligini tekshiramiz
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            // Parolni xeshlaymiz (hash)
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Boshlang'ich adminni yaratamiz
            await User.create({
                username: 'admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });

            console.log('✅ Boshlang\'ich Admin profil yaratildi: admin@gmail.com / admin123');
        }
    } catch (error) {
        console.error('Admin yaratishda xatolik:', error.message);
    }
};

module.exports = connectDB;