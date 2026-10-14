const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    caseName: { type: String, required: true },
    casePrice: { type: Number, required: true, min: 0.01 },
    imageUrl: { type: String, required: true },
    skins: [
        {
            skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin', required: true },
            chance: { type: Number, required: true, min: 0, max: 100 }
        }
    ],
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;