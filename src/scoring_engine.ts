import {
    CardName,
    CardType,
    Card,
    CARD_DATA,
    CultureCardName,
    CULTURE_CARD_DATA,
    DiceRollValue
} from './data';

/**
 * Data Structures for State
 */
export interface CardChoice {
    selectedRoll?: DiceRollValue;
    bonusProduction?: number; // For Selachonid
    isMobile?: boolean;
}

export interface PlayerCard {
    instanceId: string;
    cardName: CardName;
    choices?: CardChoice;
}

export interface PlayerTableau {
    ownedCards: PlayerCard[];
    activeCultureCards: Set<CultureCardName>;
}

export interface ComputedCard extends Card {
    instanceId: string;
    effectiveTypes: Set<CardType>;
    effectiveRolls: Set<DiceRollValue>;
    currentProduction: number;
    choices?: CardChoice;
}

/**
 * The Scoring Engine
 */
export class ScoringEngine {

    // Calculate the hypothetical max score for a card that you could buy.
    static calculateHypoMaxScore(tableau: PlayerTableau, cardName: CardName): number {
        const baseCard = CARD_DATA.get(cardName);
        if (!baseCard) {
            throw new Error(`Card data not found for card name: ${cardName}`);
        }

        let rolls: DiceRollValue[] = [];
        if (baseCard.roll === "CHOICE") {
            let possibleRolls: Set<DiceRollValue> = new Set([2, 3, 4, 5, 6, 7, 8]);
            if (cardName === CardName.DARKSPACE_HUB) {
                tableau.ownedCards
                    .filter(pCard => pCard.cardName === CardName.DARKSPACE_HUB)
                    .forEach(pCard => {
                        if (pCard.choices?.selectedRoll !== undefined) {
                            possibleRolls.delete(pCard.choices.selectedRoll);
                            if (pCard.choices?.isMobile) {
                                possibleRolls.delete((pCard.choices.selectedRoll - 1) as DiceRollValue);
                                possibleRolls.delete((pCard.choices.selectedRoll + 1) as DiceRollValue);
                            }
                        }
                    });
            }
            rolls.push(...possibleRolls);
        } else {
            rolls.push(baseCard.roll);
        }
        let highestScore = Math.max(...rolls
            .map(roll => PlayerManager.addCard(tableau, cardName, { selectedRoll: roll }))
            .map(hypoTableau => this.getProdScore(this.calculate(hypoTableau))));
        return highestScore;
    }

    static getProdScore(cards: ComputedCard[]): number {
        return (cards).reduce((acc, card) => acc + card.currentProduction, 0);
    }

    static getCreditsOnRoll(tableau: PlayerTableau, roll: DiceRollValue): number {
        let credits = 0;
        let computed = this.calculate(tableau);
        
        // Add the computed production roll to credits.
        credits = computed
            .filter(card => card.effectiveRolls.has(roll))
            .map(card => card.currentProduction)
            .reduce((acc, prod) => acc + prod, 0);
        
        // ETHEREAL: Your spirits produce an extra credit.
        if (tableau.activeCultureCards.has(CultureCardName.ETHEREAL)) {
            credits += computed
                .filter(card => card.effectiveRolls.has(roll) && card.effectiveTypes.has(CardType.SPIRIT))
                .map(() => 1)
                .reduce((acc, val) => acc + val, 0);
        }

        // DILIGENT: Each production roll, if you get credits, get an extra credit.
        if (tableau.activeCultureCards.has(CultureCardName.DILIGENT) && credits > 0) {
            credits += 1;
        }

        // PLANAR_SHEPARD: If a Bio produced for you this production roll, get 1 credit.
        let hasBioProduced = computed.some(card => card.effectiveRolls.has(roll) && card.effectiveTypes.has(CardType.BIO) && card.currentProduction > 0);
        if (hasBioProduced) {
            credits += computed
                .filter(card => card.name === CardName.PLANAR_SHEPARD)
                .map(() => 1)
                .reduce((acc, val) => acc + val, 0);
        }

        return credits;
    }

    /**
     * Main entry point to calculate the state of all cards in a player's empire.
     */
    static calculate(tableau: PlayerTableau): ComputedCard[] {
        // Phase A: Normalization (Static stats and type overrides)
        let computed = this.initializeComputedCards(tableau);

        // Phase B: Dynamic Production Calculation
        // We use a multi-pass approach to handle recursive dependencies like Planar Layline
        computed = this.resolveProduction(computed, tableau);

        return computed;
    }

    private static initializeComputedCards(tableau: PlayerTableau): ComputedCard[] {
        return tableau.ownedCards.map(pCard => {
            const baseCard = CARD_DATA.get(pCard.cardName);
            if (!baseCard) {
                throw new Error(`Card data not found for card name: ${pCard.cardName}`);
            }
            const effectiveTypes = this.calculateEffectiveTypes(baseCard, tableau);
            let rolls = this.rollValue(baseCard, pCard);

            return {
                ...baseCard,
                instanceId: pCard.instanceId,
                effectiveTypes,
                effectiveRolls: rolls,
                currentProduction: typeof baseCard.prod === 'number' ? baseCard.prod : 0,
                choices: pCard.choices
            };
        });
    }

    static calculateEffectiveTypes(baseCard: Card, tableau: PlayerTableau): Set<CardType> {
        const effectiveTypes = new Set<CardType>([baseCard.type]);
        if (baseCard.type2) effectiveTypes.add(baseCard.type2);

        // Apply Culture Card Type Overrides
        if (tableau.activeCultureCards.has(CultureCardName.MECHANIZED)) {
            if (effectiveTypes.has(CardType.BIO)) {
                effectiveTypes.add(CardType.MECH);
            }
        }
        if (tableau.activeCultureCards.has(CultureCardName.TRANSCENDENT)) {
            if (effectiveTypes.has(CardType.BIO)) {
                effectiveTypes.add(CardType.SPIRIT);
            }
        }

        return effectiveTypes;
    }

    // Apply Mobile Culture Card (adds -1 and +1 to a specific card)
    private static rollValue(baseCard: Card, pCard: PlayerCard): Set<DiceRollValue> {
        const baseRoll = this.preMobileRollValue(baseCard, pCard);
        let rolls = new Set<DiceRollValue>();
        rolls.add(baseRoll);
        if (pCard.choices?.isMobile) {
            if (baseRoll !== 8 && baseRoll + 1 <= 8) {
                rolls.add((baseRoll + 1) as DiceRollValue);
            }
            if (baseRoll !== 2 && baseRoll - 1 >= 2) {
                rolls.add((baseRoll - 1) as DiceRollValue);
            }
        }
        return rolls;
    }

    private static preMobileRollValue(baseCard: Card, pCard: PlayerCard): DiceRollValue {
        if (baseCard.roll === "CHOICE") {
            if (!pCard.choices?.selectedRoll) {
                throw new Error(`Card ${pCard.cardName} (${pCard.instanceId}) requires a roll choice but none was provided`);
            }
            return pCard.choices.selectedRoll;
        }
        return baseCard.roll;
    }

    private static resolveProduction(cards: ComputedCard[], tableau: PlayerTableau): ComputedCard[] {
        // 1. Initial Pass: Calculate non-recursive dynamic cards
        cards.forEach(card => {
            if (card.prod === "DYNAMIC") {
                card.currentProduction = this.calculateDynamicBase(card, cards, tableau);
            }
        });

        // 2. Global Additives Pass
        cards.forEach(card => {
            let bonus = 0;
            // SLUMBERING: Reveal this culture card only at the start of your first turn. When you reveal this card, pay 8 credits. Your cards have +1 production.
            if (tableau.activeCultureCards.has(CultureCardName.SLUMBERING)) bonus += 1;
            // OSTENTATIOUS: Your cards with base cost of 7 credits or more have +1 production.
            if (tableau.activeCultureCards.has(CultureCardName.OSTENTATIOUS) && card.cost >= 7) bonus += 1;

            // MYSTRICAL: You must pay 3 credits to reveal this card. Your non-spirit cards that have another spirit with the same roll value have +1 production.
            if (tableau.activeCultureCards.has(CultureCardName.MYSTICAL) && !card.effectiveTypes.has(CardType.SPIRIT)) {
                const sharesRollWithSpirit = cards.some(other =>
                    other.instanceId !== card.instanceId &&
                    other.effectiveTypes.has(CardType.SPIRIT) &&
                    other.effectiveRolls.intersection(card.effectiveRolls).size > 0
                );
                if (sharesRollWithSpirit) bonus += 1;
            }

            // AUTONOMOUS: You must pay 4 credits to reveal this card. Your cards with a unique dice roll value have +1 production.
            if (tableau.activeCultureCards.has(CultureCardName.AUTONOMOUS)) {
                const sharesRoll = cards.some(other =>
                    other.instanceId !== card.instanceId &&
                    other.effectiveRolls.intersection(card.effectiveRolls).size > 0
                );
                if (!sharesRoll) bonus += 1;
            }

            // ORTHODOX: Your Bio cards with 3 or more production have +1 production.
            if (tableau.activeCultureCards.has(CultureCardName.ORTHODOX)) {
                const isBio = card.effectiveTypes.has(CardType.BIO);
                const isHighProduction = (card.currentProduction + bonus) >= 3;
                if (isBio && isHighProduction) {
                    bonus += 1;
                }
            }

            card.currentProduction += bonus;
        });

        // 3. Recursive Pass (Planar Layline)
        // We run this multiple times until values stop changing (converging)
        // Max 5 passes to prevent infinite loops from invalid game states
        for (let i = 0; i < 5; i++) {
            let changed = false;
            cards.forEach(card => {
                if (card.name === CardName.PLANAR_LAYLINE) {
                    const otherCardsWithDifferentDiceRollValue = cards.filter(c =>
                        c.effectiveRolls.intersection(card.effectiveRolls).size === 0
                    );
                    const maxOtherProd = otherCardsWithDifferentDiceRollValue.length > 0
                        ? Math.max(...otherCardsWithDifferentDiceRollValue.map(c => c.currentProduction))
                        : 0;

                    if (card.currentProduction !== maxOtherProd) {
                        card.currentProduction = maxOtherProd;
                        changed = true;
                    }
                }
            });
            if (!changed) break;
        }

        return cards;
    }

    private static calculateDynamicBase(card: ComputedCard, all: ComputedCard[], tableau: PlayerTableau): number {
        switch (card.name) {
            case CardName.ANCIENT_GATE:
                const counts = new Map<CardName, number>();
                all.forEach(c => counts.set(c.name, (counts.get(c.name) || 0) + 1));
                return Math.max(...Array.from(counts.values()), 0);

            case CardName.COLLECTIVE:
                const freq = new Map<CardName, number>();
                all.forEach(c => freq.set(c.name, (freq.get(c.name) || 0) + 1));
                const pairs = Array.from(freq.values()).filter(v => v > 1).length;
                return pairs * 2;

            case CardName.TRANSIT_HUB:
                return new Set(all.flatMap(c => Array.from(c.effectiveRolls))).size;

            case CardName.YGGDRASIL:
                return all.filter(c => c.effectiveTypes.has(CardType.BIO)).length;

            case CardName.DYSON_CAGE:
                return all.filter(c => c.effectiveTypes.has(CardType.SPIRIT)).length;

            case CardName.WORLD_FORGER:
                const uniqueMechs = new Set(all.filter(c => c.effectiveTypes.has(CardType.MECH)).map(c => c.name));
                return uniqueMechs.size;

            case CardName.SELACHONID:
                return (card.choices?.bonusProduction || 0);

            case CardName.ZYGATE_INTERCHANGE:
                const distinctRolls = new Set(all.flatMap(c => Array.from(c.effectiveRolls))).size;
                console.log(distinctRolls);
                return distinctRolls >= 7 ? 3 : 1;

            case CardName.THE_SPIRE:
                const bioCount = all.filter(c => c.effectiveTypes.has(CardType.BIO)).length;
                return bioCount >= 2 ? 4 : 2;

            case CardName.THOUGHT_CURATOR:
                const bioRolls = new Set(all.filter(c => c.effectiveTypes.has(CardType.BIO)).flatMap(c => Array.from(c.effectiveRolls)));
                return bioRolls.size;

            case CardName.PLANAR_LAYLINE:
                return 0;

            default:
                throw new Error(`Unhandled dynamic card type: ${card.name}`);
        }
    }
}

/**
 * Utility class to manage player state mutations IMMUTABLY.
 * Used by React state dispatchers.
 */
export class PlayerManager {
    static createTableau(): PlayerTableau {
        return { ownedCards: [], activeCultureCards: new Set() };
    }

    static addCard(tableau: PlayerTableau, name: CardName, choices: CardChoice = {}): PlayerTableau {
        const newCard: PlayerCard = {
            instanceId: crypto.randomUUID(),
            cardName: name,
            choices
        };
        return {
            ...tableau,
            ownedCards: [...tableau.ownedCards, newCard]
        };
    }

    static removeCard(tableau: PlayerTableau, instanceId: string): PlayerTableau {
        return {
            ...tableau,
            ownedCards: tableau.ownedCards.filter(c => c.instanceId !== instanceId)
        };
    }

    static toggleCulture(tableau: PlayerTableau, name: CultureCardName): PlayerTableau {
        const newSet = new Set(tableau.activeCultureCards);
        let newOwned = tableau.ownedCards;
        if (newSet.has(name)) {
            newSet.delete(name);
            // If turning off Mobile, clear the Mobile flag from all cards
            if (name === 'Mobile' as CultureCardName) {
                newOwned = newOwned.map(c => ({
                    ...c,
                    choices: { ...c.choices, isMobile: false }
                }));
            }
        } else {
            newSet.add(name);
        }
        return {
            ...tableau,
            activeCultureCards: newSet,
            ownedCards: newOwned
        };
    }

    static setCardMobile(tableau: PlayerTableau, instanceId: string): PlayerTableau {
        // 1. Set isMobile=true for the target, false for everyone else
        // 2. Ensure 'Mobile' culture card is active
        const newOwned = tableau.ownedCards.map(c => ({
            ...c,
            choices: { ...c.choices, isMobile: c.instanceId === instanceId }
        }));
        const newCulture = new Set(tableau.activeCultureCards);
        newCulture.add('Mobile' as CultureCardName);
        return {
            ...tableau,
            ownedCards: newOwned,
            activeCultureCards: newCulture
        };
    }

    static changeCardBonus(tableau: PlayerTableau, instanceId: string, isIncrease: boolean): PlayerTableau {
        const cardExists = tableau.ownedCards.some(card => card.instanceId === instanceId);
        if (!cardExists) {
            throw new Error(`Card with instanceId ${instanceId} not found`);
        }

        return {
            ...tableau,
            ownedCards: tableau.ownedCards.map(card =>
                card.instanceId === instanceId
                    ? {
                        ...card,
                        choices: {
                            ...card.choices,
                            bonusProduction: (card.choices?.bonusProduction || 0) + (isIncrease ? 2 : -2)
                        }
                    }
                    : card
            )
        };
    }
}
