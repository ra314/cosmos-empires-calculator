import { Card, CardName, CardType, DiceRollValue } from './data';


interface PlayerCardInstance {
    readonly data: Card; 
    qty: number;
    roll?: DiceRollValue[];
}

interface PlayerCards {
    cards: Map<CardName, PlayerCardInstance>;
}

// The roll values selected by darkspace hub
export function getNonConflictingRollValues(playerCardObj: PlayerCards): Set<DiceRollValue> {
    return new Set(playerCardObj.cards.get(CardName.DARKSPACE_HUB)?.roll ?? []);
}

export function getAllRollValues(playerCardObj: PlayerCards): Set<DiceRollValue> {
    let retval = new Set<DiceRollValue>();
    for (const instance of playerCardObj.cards.values()) {
        if (instance.roll !== undefined && instance.roll.length > 0) {
            instance.roll.forEach(item => retval.add(item));
        } else {
            if (typeof instance.data.roll !== "string") {
                retval.add(instance.data.roll);
            }
        }
    } 
    return retval;
}

export function calcDynProd(cardName: CardName, playerCardObj: PlayerCards): number {
    // We use instance.data.name instead of looking up in a Map
    switch (cardName) {
        // Prod = Size of your largest set of a single card name.
        case CardName.ANCIENT_GATE: {
            return Math.max(
                0,
                ...Array.from(playerCardObj.cards.values()).map(card => card.qty)
            );
        }

        // Prod = 2 * (Number of unique card names where you own > 1 copy)
        case CardName.COLLECTIVE: {
            return Array.from(playerCardObj.cards.values())
                .filter(card => card.qty > 1)
                .length * 2;
        }

        // Prod = Number of BIO cards you own (counts itself).
        case CardName.YGGDRASIL: {
            return Array.from(playerCardObj.cards.values())
                .filter(card => card.data.type === CardType.BIO)
                .reduce((sum, card) => sum + card.qty, 0);
        }

        // The Transit Hub's production is equal to the number of different roll values you have represented by your built cards.
        case CardName.TRANSIT_HUB: {
            const rollValues = new Set(
                Array.from(playerCardObj.cards.values())
                    .flatMap(card => (card.roll && card.roll.length > 0) ? card.roll : [card.data.roll])
            );
            return rollValues.size;
        }

        default:
            return 0;
    }
}

function calcSingleCardProd(instance: PlayerCardInstance, playerCardObj: PlayerCards): number {
    if (instance.data.prod === "DYNAMIC") {
        return calcDynProd(instance.data.name, playerCardObj);
    }
    return instance.data.prod;
}

export function calculateScore(playerCardObj: PlayerCards): number {
    let total = 0;
    for (const instance of playerCardObj.cards.values()) {
        total += calcSingleCardProd(instance, playerCardObj)*instance.qty;
    }
    return total;
}

function numActivatedCards(instance: PlayerCardInstance, roll: number): number {
    if (instance.data.roll !== "CHOICE") {
        if (instance.data.roll === roll) {
            return instance.qty;
        }
    }
    return (instance.roll ?? []).filter(num => num === roll).length;
}

export function calculateProductionForRoll(playerCardObj: PlayerCards, roll: number): number {
    let totalProd = 0;
    for (const instance of playerCardObj.cards.values()) {
        let num = numActivatedCards(instance, roll);
        totalProd += calcSingleCardProd(instance, playerCardObj) * num;
    }
    return totalProd;
}