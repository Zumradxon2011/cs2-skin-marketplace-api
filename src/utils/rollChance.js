// 'chance' (og'irlik) bo'yicha weighted random tanlov algoritmi
// items = [{ skin: ..., chance: 45 }, { skin: ..., chance: 30 }, ...]
// Jami chance 100 ga teng bo'lmasa ham to'g'ri ishlaydi (nixtalarga bo'linadi)
const rollChance = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const total = items.reduce((sum, item) => sum + (Number(item.chance) || 0), 0);
    if (total <= 0) {
        return null;
    }

    // 0 dan total gacha oraliqda tasodifiy son olamiz
    let roll = Math.random() * total;

    for (const item of items) {
        roll -= Number(item.chance) || 0;
        if (roll < 0) {
            return item;
        }
    }

    // Floating point aniqligi uchun zaxira variant (oxirgi element)
    return items[items.length - 1];
};

module.exports = rollChance;
