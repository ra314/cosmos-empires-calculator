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
    return new Set(
        Array.from(playerCardObj.cards.values())
            .flatMap(instance => (instance.roll && instance.roll.length > 0) ? instance.roll : [instance.data.roll])
            .filter((roll): roll is DiceRollValue => typeof roll !== "string")
    );
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
                .filter(card => card.data.type === CardType.BIO || card.data.type2 === CardType.BIO)
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

        // Production is equal to the number of Spirit cards you have.
        case CardName.DYSON_CAGE: {
            return Array.from(playerCardObj.cards.values())
                .filter(card => card.data.type === CardType.SPIRIT || card.data.type2 === CardType.SPIRIT)
                .reduce((sum, card) => sum + card.qty, 0);
        }

        // Production is equal to the number of different Mech card names you have.
        case CardName.WORLD_FORGER: {
            const uniqueMechNames = new Set(
                Array.from(playerCardObj.cards.values())
                    .filter(card => card.data.type === CardType.MECH || card.data.type2 === CardType.MECH)
                    .map(card => card.data.name)
            );
            return uniqueMechNames.size;
        }

        // Production is equal to the largest production among your cards with a different dice roll value from this card.
        case CardName.PLANAR_LAYLINE: {
            // const nonPlanarLaylineProdValues = 
            //     Array.from(playerCardObj.cards.values())
            //     .filter(card => card.data.name !== CardName.PLANAR_LAYLINE)
            //     .map(card => calcDynProd(card.data.name, playerCardObj));
            // return Math.max(...nonPlanarLaylineProdValues);
            return 0;
        }

        // Production is equal to the number of different dice roll values you have with bios.
        case CardName.THOUGHT_CURATOR: {
            const rollValues = new Set(
                Array.from(playerCardObj.cards.values())
                    .filter(card => card.data.type === CardType.BIO || card.data.type2 === CardType.BIO)
                    .flatMap(card => (card.roll && card.roll.length > 0) ? card.roll : [card.data.roll])
            );
            return rollValues.size;
        }

        default:
            throw new Error(`calcDynProd: Unexpected card name "${cardName}" does not have dynamic production defined`);
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