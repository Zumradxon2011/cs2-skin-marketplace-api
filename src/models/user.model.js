const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    wallet: {
        type: Number,
        default: 0,
        min: 0
    },
    refreshToken: {
        type: String,
        default: null
    }

    // Eslatma: skinlar endi alohida 'Inventory' kolleksiyasida saqlanadi
    // (kimniki, qaysi kesadan tushgan, sotildimi — tarixi bilan)
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;