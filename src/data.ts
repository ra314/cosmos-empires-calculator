/**
 * Cosmos Empires - Card Database
 */

export enum CardType {
    BIO = "BIO",
    MECH = "MECH",
    SPIRIT = "SPIRIT"
}

export enum CardName {
    ANCIENT_GATE = "Ancient Gate",
    BEACON_HUB = "Beacon Hub",
    COLLECTIVE = "Collective",
    DARKSPACE_HUB = "Darkspace Hub",
    DEEPSPACE_SCOUTS = "Deepspace Scouts",
    DISCOVERY = "Discovery",
    FABRICATOR_BELT = "Fabricator Belt",
    LIBRARIAN = "Librarian",
    MERV = "M.E.R.V",
    NAUTILUS = "Nautilus",
    NEBULA_WHALE = "Nebula Whale",
    SERAPH_GATE = "Seraph Gate",
    T_WING = "T-Wing",
    TRANSIT_HUB = "Transit Hub",
    WORLD_SHIP = "World Ship",
    YGGDRASIL = "Yggdrasil",
    // Culture Clash Expansion
    CEREBRAZOA = "Cerebrazoa",
    SPIRIT_OF_THE_HUNT = "Spirit of the Hunt",
    HIVE_WARDEN = "Hive Warden",
    STARFIELD_WALKER = "Starfield Walker",
    DYSON_CAGE = "Dyson Cage",
    THOUGHT_RECYCLER = "Thought Recycler",
    SELACHONID = "Selachonid",
    THE_SPIRE = "The Spire",
    SERVAZOA = "Servazoa",
    DREADNOUGHT = "Dreadnought",
    FIREFLY_DRONE = "Firefly Drone",
    BELT_OAK = "Belt Oak",
    BROODMOTHER = "Broodmother",
    WORLD_FORGER = "World Forger",
    ZYGATE_INTERCHANGE = "Zygate Interchange",
    PLANAR_SHEPARD = "Planar Shepard",
    PLANAR_LAYLINE = "Planar Layline",
    THOUGHT_CURATOR = "Thought Curator"
}

export type DiceRollValue = 2 | 3 | 4 | 5 | 6 | 7 | 8;

type ProdValue = number | "DYNAMIC";
type RollValue = DiceRollValue | "CHOICE";

export interface Card {
    name: CardName;
    type: CardType;
    type2?: CardType;
    cost: number;
    prod: ProdValue;
    roll: RollValue;
    qty: number;
    desc?: string;
    culture_clash: boolean;
}

export const CARD_DATA: Map<CardName, Card>  = new Map([
    { name: CardName.ANCIENT_GATE,      type: CardType.MECH,    culture_clash: false,   cost: 3, prod: "DYNAMIC" as const, 	roll: 7 as const, 		qty: 5,                         desc: "Prod = Size of your largest set of a single card name." },
    { name: CardName.BEACON_HUB,        type: CardType.MECH,    culture_clash: false,   cost: 4, prod: 1, 					roll: 8 as const, 		qty: 5 },
    { name: CardName.COLLECTIVE,        type: CardType.SPIRIT,  culture_clash: false,   cost: 8, prod: "DYNAMIC" as const, 	roll: 6 as const, 		qty: 3,                         desc: "Prod = 2 * (Number of unique card names where you own > 1 copy)." },
    { name: CardName.DARKSPACE_HUB,     type: CardType.MECH,    culture_clash: false,   cost: 6, prod: 4, 					roll: "CHOICE" as const,qty: 5,                         desc: "On purchase, choose a roll value (2-8). Cannot match a roll value you already own." },
    { name: CardName.DEEPSPACE_SCOUTS,  type: CardType.MECH,    culture_clash: false,   cost: 3, prod: 1, 					roll: 7 as const, 		qty: 5 },
    { name: CardName.DISCOVERY,         type: CardType.MECH,    culture_clash: false,   cost: 2, prod: 1, 					roll: 6 as const, 		qty: 5 },
    { name: CardName.FABRICATOR_BELT,   type: CardType.MECH,    culture_clash: false,   cost: 7, prod: 1, 					roll: 5 as const, 		qty: 5 },
    { name: CardName.LIBRARIAN,         type: CardType.SPIRIT,  culture_clash: false,   cost: 5, prod: 3, 					roll: 5 as const, 		qty: 7 },
    { name: CardName.MERV,              type: CardType.MECH,    culture_clash: false,   cost: 5, prod: 3, 					roll: 4 as const, 		qty: 7 },
    { name: CardName.NAUTILUS,          type: CardType.BIO,     culture_clash: false,   cost: 1, prod: 2, 					roll: 2 as const, 		qty: 7 },
    { name: CardName.NEBULA_WHALE,      type: CardType.SPIRIT,  culture_clash: false,   cost: 2, prod: 2, 					roll: 6 as const, 		qty: 5 },
    { name: CardName.SERAPH_GATE,       type: CardType.BIO,     culture_clash: false,   cost: 5, prod: 1, 					roll: 4 as const, 		qty: 5 },
    { name: CardName.T_WING,            type: CardType.MECH,    culture_clash: false,   cost: 1, prod: 1, 					roll: 7 as const, 		qty: 5 },
    { name: CardName.TRANSIT_HUB,       type: CardType.MECH,    culture_clash: false,   cost: 7, prod: "DYNAMIC" as const, 	roll: 8 as const, 		qty: 5,                         desc: "Prod = Number of unique dice roll values you own. Max 7." },
    { name: CardName.WORLD_SHIP,        type: CardType.MECH,    culture_clash: false,   cost: 6, prod: 4, 					roll: 3 as const, 		qty: 5 },
    { name: CardName.YGGDRASIL,         type: CardType.BIO,     culture_clash: false,   cost: 7, prod: "DYNAMIC" as const, 	roll: 3 as const, 		qty: 5,                         desc: "Prod = Number of BIO cards you own (counts itself)." },
    // Culture Clash Expansion
    { name: CardName.CEREBRAZOA,        type: CardType.SPIRIT,  culture_clash: true,    cost: 0, prod: 2, 					roll: 2 as const, 		qty: 3 },
    { name: CardName.DYSON_CAGE,        type: CardType.MECH,    culture_clash: true,    cost: 4, prod: "DYNAMIC" as const, 	roll: 2 as const, 		qty: 3,                         desc: "Production is equal to the number of Spirit cards you have." },
    { name: CardName.SERVAZOA,          type: CardType.MECH,    culture_clash: true,    cost: 3, prod: 2, 					roll: 2 as const, 		qty: 3,                         desc: "Once per turn, if you may Patrol, gain 2 Credits." },
    { name: CardName.BROODMOTHER,       type: CardType.BIO,     culture_clash: true,    cost: 6, prod: 1, 					roll: 3 as const, 		qty: 3,                         desc: "Each turn you may build an extra Bio that costs 3 or less." },
    { name: CardName.SPIRIT_OF_THE_HUNT,type: CardType.SPIRIT,  culture_clash: true,    cost: 1, prod: 1, 					roll: 3 as const, 		qty: 3,                         desc: "Once per turn, you may Patrol." },
    { name: CardName.THOUGHT_RECYCLER,  type: CardType.BIO,     culture_clash: true,    cost: 4, prod: 1, 					roll: 3 as const, 		qty: 3, type2: CardType.MECH,   desc: "If you have more Bio than Spirits, Spirits cost 1 less for you." },
    { name: CardName.DREADNOUGHT,       type: CardType.MECH,    culture_clash: true,    cost: 4, prod: 2, 					roll: 4 as const, 		qty: 3,                         desc: "Once per turn, you may Patrol." },
    { name: CardName.WORLD_FORGER,      type: CardType.SPIRIT,  culture_clash: true,    cost: 5, prod: "DYNAMIC" as const, 	roll: 4 as const, 		qty: 3,                         desc: "Production is equal to the number of different Mech card names you have." },
    { name: CardName.HIVE_WARDEN,       type: CardType.BIO,     culture_clash: true,    cost: 7, prod: 2, 					roll: 5 as const, 		qty: 3,                         desc: "When built, you may build another card." },
    { name: CardName.SELACHONID,        type: CardType.BIO,     culture_clash: true,    cost: 4, prod: "DYNAMIC" as const, 	roll: 5 as const, 		qty: 3,                         desc: "Once per turn, Discard one of your cards. Selachonid gets +2 production." },
    { name: CardName.FIREFLY_DRONE,     type: CardType.MECH,    culture_clash: true,    cost: 3, prod: 1, 					roll: 6 as const, 		qty: 3,                         desc: "Once per turn, you may Patrol." },
    { name: CardName.ZYGATE_INTERCHANGE,type: CardType.BIO,     culture_clash: true,    cost: 3, prod: 1, 					roll: 6 as const, 		qty: 3, type2: CardType.SPIRIT, desc: "If you have a card with every roll value (2 to 8) (including this card) this card gets two more production. A card with Mobile counts as all roll values." },
    { name: CardName.STARFIELD_WALKER,  type: CardType.BIO,     culture_clash: true,    cost: 8, prod: 5, 					roll: 7 as const, 		qty: 3 },
    { name: CardName.THE_SPIRE,         type: CardType.SPIRIT,  culture_clash: true,    cost: 5, prod: 2, 					roll: 7 as const, 		qty: 3, type2: CardType.MECH,   desc: "If you have 2 cards that have Bio as one of their types, this card gets two more production." },
    { name: CardName.BELT_OAK,          type: CardType.BIO,     culture_clash: true,    cost: 2, prod: 1, 					roll: 8 as const, 		qty: 3,                         desc: "When built, get 2 Credits." },
    { name: CardName.PLANAR_SHEPARD,    type: CardType.SPIRIT,  culture_clash: true,    cost: 5, prod: 2, 					roll: 8 as const, 		qty: 3,                         desc: "On each production roll, if one of your cards with a Bio in its type produces Credits for you, you will get an extra credit. You can't get more than 1 Credit from this ability each production roll, unless you have another Planar Shepherd." },

].map(card => [card.name, card]));
