const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        // Bazada admin borligini tekshiramiz
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin allaqachon mavjud.');
            return;
        }

        // Agar .env faylda yozilmagan bo'lsa, xatolik chiqmasligi uchun standart qiymat beramiz
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';

        // Parolni shifrlaymiz
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Yangi admin yaratamiz
        const adminUser = new User({
            username: 'SuperAdmin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            wallet: 10000
        });

        await adminUser.save();
        console.log(`Boshlang'ich Admin muvaffaqiyatli yaratildi! Email: ${adminEmail}`);
    } catch (error) {
        console.error('Admin yaratishda xatolik:', error.message);
    }
};

module.exports = seedAdmin;