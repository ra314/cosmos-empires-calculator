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
            const baseCard = CARD_DATA.get(pCard.cardName)!;
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

    private static calculateEffectiveTypes(baseCard: Card, tableau: PlayerTableau): Set<CardType> {
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

        // 2. Global Additives Pass (Slumbering, Ostentatious, etc.)
        cards.forEach(card => {
            let bonus = 0;
            if (tableau.activeCultureCards.has(CultureCardName.SLUMBERING)) bonus += 1;
            if (tableau.activeCultureCards.has(CultureCardName.OSTENTATIOUS) && card.cost >= 7) bonus += 1;
            
            // Mystical Logic: Non-spirit sharing roll with a spirit
            if (tableau.activeCultureCards.has(CultureCardName.MYSTICAL) && !card.effectiveTypes.has(CardType.SPIRIT)) {
                const sharesRollWithSpirit = cards.some(other => 
                    other.instanceId !== card.instanceId && 
                    other.effectiveTypes.has(CardType.SPIRIT) &&
                    other.effectiveRolls.intersection(card.effectiveRolls).size > 0
                );
                if (sharesRollWithSpirit) bonus += 1;
            }

            // AUTONOMOUS
            if (tableau.activeCultureCards.has(CultureCardName.AUTONOMOUS)) {
                const sharesRoll = cards.some(other => 
                    other.instanceId !== card.instanceId && 
                    other.effectiveRolls.intersection(card.effectiveRolls).size > 0
                );
                if (!sharesRoll) bonus += 1;
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
                return new Set(all.flatMap(c => c.effectiveRolls)).size;

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
                const distinctRolls = new Set(all.flatMap(c => c.effectiveRolls)).size;
                return distinctRolls >= 7 ? 3 : 1;

            case CardName.THE_SPIRE:
                const bioCount = all.filter(c => c.effectiveTypes.has(CardType.BIO)).length;
                return bioCount >= 2 ? 4 : 2;

            case CardName.THOUGHT_CURATOR:
                const bioRolls = new Set(all.filter(c => c.effectiveTypes.has(CardType.BIO)).flatMap(c => c.effectiveRolls));
                return bioRolls.size;

            default:
                return 0;
        }
    }
}

/**
 * Utility class to manage player state mutations
 */
export class PlayerManager {
    private state: PlayerTableau;

    constructor(initialState?: PlayerTableau) {
        this.state = initialState || { ownedCards: [], activeCultureCards: new Set() };
    }

    addCard(name: CardName, choices?: CardChoice) {
        this.state.ownedCards.push({
            instanceId: crypto.randomUUID(),
            cardName: name,
            choices
        });
    }

    removeCard(instanceId: string) {
        this.state.ownedCards = this.state.ownedCards.filter(c => c.instanceId !== instanceId);
    }

    updateChoice(instanceId: string, choices: Partial<CardChoice>) {
        const card = this.state.ownedCards.find(c => c.instanceId === instanceId);
        if (card) {
            card.choices = { ...card.choices, ...choices };
        }
    }

    toggleCulture(name: CultureCardName) {
        if (this.state.activeCultureCards.has(name)) {
            this.state.activeCultureCards.delete(name);
        } else {
            this.state.activeCultureCards.add(name);
        }
    }

    getState() {
        return this.state;
    }

    getTotalProduction(): number {
        const computed = ScoringEngine.calculate(this.state);
        return computed.reduce((sum, card) => sum + card.currentProduction, 0);
    }
}