/**
 * Cosmos Empires - Scoring Engine
 */

function calculateCardContribution(cardName, rolls, playerCardObj) {
    const card = CARD_DATA.find(c => c.name === cardName);
    if (!card) return 0;
    const count = rolls.length;

    const cardCounts = {};
    Object.entries(playerCardObj).forEach(([name, rList]) => {
        cardCounts[name] = rList.length;
    });

    let perCardVal = 0;
    if (card.prod !== "DYNAMIC") {
        perCardVal = card.prod;
    } else if (cardName === "Ancient Gate") {
        perCardVal = Math.max(...Object.values(cardCounts), 0);
    } else if (cardName === "Collective") {
        perCardVal = Object.values(cardCounts).filter(c => c > 1).length * 2;
    } else if (cardName === "Yggdrasil") {
        const bioCount = Object.entries(playerCardObj).reduce((sum, [cName, rList]) => {
            const c = CARD_DATA.find(cd => cd.name === cName);
            return sum + (c && c.type === "BIO" ? rList.length : 0);
        }, 0);
        perCardVal = bioCount;
    } else if (cardName === "Transit Hub") {
        const rollSet = new Set();
        Object.entries(playerCardObj).forEach(([cName, rList]) => {
            const c = CARD_DATA.find(cd => cd.name === cName);
            rList.forEach(r => {
                if (r !== null) rollSet.add(r);
                else if (c && c.roll !== "CHOICE" && c.roll !== "DYNAMIC") rollSet.add(c.roll);
            });
        });
        perCardVal = Math.min(rollSet.size, 7);
    }
    return perCardVal * count;
}

function calculateScore(playerCardObj) {
    return Object.entries(playerCardObj).reduce((acc, [name, rolls]) => {
        return acc + calculateCardContribution(name, rolls, playerCardObj);
    }, 0);
}

function calculateProductionForRoll(player, roll) {
    let prod = 0;
    Object.entries(player.cards).forEach(([name, rolls]) => {
        const card = CARD_DATA.find(c => c.name === name);
        if (!card) return;
        let cardSpecificTotal = calculateCardContribution(name, rolls, player.cards);
        let perCardValue = rolls.length > 0 ? cardSpecificTotal / rolls.length : 0;
        rolls.forEach(r => {
            const effectiveRoll = r !== null ? r : card.roll;
            if (effectiveRoll == roll) prod += perCardValue;
        });
    });
    return prod;
}

function getPlayerRollValues(player) {
    const rolls = new Set();
    Object.entries(player.cards).forEach(([name, rList]) => {
        const card = CARD_DATA.find(c => c.name === name);
        rList.forEach(r => {
            if (r !== null) rolls.add(r);
            else if (card && card.roll !== "CHOICE" && card.roll !== "DYNAMIC") rolls.add(card.roll);
        });
    });
    return rolls;
}
