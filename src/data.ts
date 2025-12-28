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
    YGGDRASIL = "Yggdrasil"
}

type ProdValue = number | "DYNAMIC";
type RollValue = number | "CHOICE";

export interface Card {
    name: CardName;
    type: CardType;
    cost: number;
    prod: ProdValue;
    roll: RollValue;
    qty: number;
    desc?: string;
}

export const CARD_DATA: Map<CardName, Card>  = new Map([
    { name: CardName.ANCIENT_GATE,     type: CardType.MECH,    cost: 3, prod: "DYNAMIC" as const, 	roll: 7, 				qty: 5, desc: "Prod = Size of your largest set of a single card name." },
    { name: CardName.BEACON_HUB,       type: CardType.MECH,    cost: 4, prod: 1, 					roll: 8, 				qty: 5 },
    { name: CardName.COLLECTIVE,       type: CardType.SPIRIT,  cost: 8, prod: "DYNAMIC" as const, 	roll: 6, 				qty: 3, desc: "Prod = 2 * (Number of unique card names where you own > 1 copy)." },
    { name: CardName.DARKSPACE_HUB,    type: CardType.MECH,    cost: 6, prod: 4, 					roll: "CHOICE" as const,qty: 5, desc: "On purchase, choose a roll value (2-8). Cannot match a roll value you already own." },
    { name: CardName.DEEPSPACE_SCOUTS, type: CardType.MECH,    cost: 3, prod: 1, 					roll: 7, 				qty: 5 },
    { name: CardName.DISCOVERY,        type: CardType.MECH,    cost: 2, prod: 1, 					roll: 6, 				qty: 5 },
    { name: CardName.FABRICATOR_BELT,  type: CardType.MECH,    cost: 7, prod: 1, 					roll: 5, 				qty: 5 },
    { name: CardName.LIBRARIAN,        type: CardType.SPIRIT,  cost: 5, prod: 3, 					roll: 5, 				qty: 7 },
    { name: CardName.MERV,             type: CardType.MECH,    cost: 5, prod: 3, 					roll: 4, 				qty: 7 },
    { name: CardName.NAUTILUS,         type: CardType.BIO,     cost: 1, prod: 2, 					roll: 2, 				qty: 7 },
    { name: CardName.NEBULA_WHALE,     type: CardType.SPIRIT,  cost: 2, prod: 2, 					roll: 6, 				qty: 5 },
    { name: CardName.SERAPH_GATE,      type: CardType.BIO,     cost: 5, prod: 1, 					roll: 4, 				qty: 5 },
    { name: CardName.T_WING,           type: CardType.MECH,    cost: 1, prod: 1, 					roll: 7, 				qty: 5 },
    { name: CardName.TRANSIT_HUB,      type: CardType.MECH,    cost: 7, prod: "DYNAMIC" as const, 	roll: 8, 				qty: 5, desc: "Prod = Number of unique dice roll values you own. Max 7." },
    { name: CardName.WORLD_SHIP,       type: CardType.MECH,    cost: 6, prod: 4, 					roll: 3, 				qty: 5 },
    { name: CardName.YGGDRASIL,        type: CardType.BIO,     cost: 7, prod: "DYNAMIC" as const, 	roll: 3, 				qty: 5, desc: "Prod = Number of BIO cards you own (counts itself)." }
].map(card => [card.name, card]));
