require('dotenv').config();
const dns = require('dns');

// DNS tuzatish (lokal muhitda Atlas SRV yechimi uchun).
// Render kabi platformalarda tashqi DNS (53-port) bloklangan bo'lishi mumkin,
// shuning uchun u yerda tizimning o'z DNS'i ishlatiladi (RENDER=true avto o'rnatiladi).
// Kerak bo'lsa SKIP_DNS_FIX=1 bilan istalgan joyda o'chirish mumkin.
if (!process.env.RENDER && process.env.SKIP_DNS_FIX !== '1') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');

// Routerlarni ulash
const skinsRouter = require('./routes/skins.routes');
const usersRouter = require('./routes/user.routes');
const authRouter = require('./routes/auth.routes');
const casesRouter = require('./routes/case.routes');
const transactionsRouter = require('./routes/transaction.routes');

const app = express();

// Middleware'lar
app.use(cors());
app.use(express.json());

// Statik papka (rasmlarni brauzerda ochish uchun)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Endpointlar
app.use('/api/skins', skinsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/transactions', transactionsRouter);

// Boshlang'ich tekshiruv route'i
app.get('/', (req, res) => {
    res.send("CS2 Marketplace API ishlayapti!");
});

// Bazaga ulanish, adminni tekshirib qo'shish va Serverni ishga tushirish
const PORT = process.env.PORT || 5432;

connectDB().then(async () => {
    await seedAdmin(); // Avval admin bor-yo'qligini tekshiradi/yaratadi
    
    app.listen(PORT, () => {
        console.log(`Server ishga tushdi: http://localhost:${PORT}`);
    });
});