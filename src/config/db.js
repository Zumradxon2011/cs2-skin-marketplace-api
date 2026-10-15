const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB'); 
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Eslatma: boshlang'ich adminni utils/seedAdmin.js yaratadi
// (eski createInitialAdmin funksiyasi o'lik kod edi — o'chirildi)

module.exports = connectDB;