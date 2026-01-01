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
    { name: CardName.SERVAZOA,          type: CardType.MECH,    culture_clash: true,    cost: 3, prod: 2, 					roll: 2 as const, 		qty: 3},
    { name: CardName.BROODMOTHER,       type: CardType.BIO,     culture_clash: true,    cost: 6, prod: 1, 					roll: 3 as const, 		qty: 3},
    { name: CardName.SPIRIT_OF_THE_HUNT,type: CardType.SPIRIT,  culture_clash: true,    cost: 1, prod: 1, 					roll: 3 as const, 		qty: 3},
    { name: CardName.THOUGHT_RECYCLER,  type: CardType.BIO,     culture_clash: true,    cost: 4, prod: 1, 					roll: 3 as const, 		qty: 3, type2: CardType.MECH},
    { name: CardName.DREADNOUGHT,       type: CardType.MECH,    culture_clash: true,    cost: 4, prod: 2, 					roll: 4 as const, 		qty: 3},
    { name: CardName.WORLD_FORGER,      type: CardType.SPIRIT,  culture_clash: true,    cost: 5, prod: "DYNAMIC" as const, 	roll: 4 as const, 		qty: 3,                         desc: "Production is equal to the number of different Mech card names you have." },
    { name: CardName.HIVE_WARDEN,       type: CardType.BIO,     culture_clash: true,    cost: 7, prod: 2, 					roll: 5 as const, 		qty: 3},
    { name: CardName.SELACHONID,        type: CardType.BIO,     culture_clash: true,    cost: 4, prod: "DYNAMIC" as const,	roll: 5 as const, 		qty: 3,                         desc: "Once per turn, Discard one of your cards. Selachonid gets +2 production." },
    { name: CardName.FIREFLY_DRONE,     type: CardType.MECH,    culture_clash: true,    cost: 3, prod: 1, 					roll: 6 as const, 		qty: 3},
    { name: CardName.ZYGATE_INTERCHANGE,type: CardType.BIO,     culture_clash: true,    cost: 3, prod: "DYNAMIC" as const,	roll: 6 as const, 		qty: 3, type2: CardType.SPIRIT, desc: "+2 production if you have 7 different roll values." },
    { name: CardName.STARFIELD_WALKER,  type: CardType.BIO,     culture_clash: true,    cost: 8, prod: 5, 					roll: 7 as const, 		qty: 3 },
    { name: CardName.THE_SPIRE,         type: CardType.SPIRIT,  culture_clash: true,    cost: 5, prod: "DYNAMIC" as const,	roll: 7 as const, 		qty: 3, type2: CardType.MECH,   desc: "+2 production if you have 2 Bio cards." },
    { name: CardName.BELT_OAK,          type: CardType.BIO,     culture_clash: true,    cost: 2, prod: 1, 					roll: 8 as const, 		qty: 3},
    { name: CardName.PLANAR_SHEPARD,    type: CardType.SPIRIT,  culture_clash: true,    cost: 5, prod: 2, 					roll: 8 as const, 		qty: 3},
    { name: CardName.PLANAR_LAYLINE,    type: CardType.SPIRIT,  culture_clash: true,    cost: 9, prod: "DYNAMIC" as const,  roll: "CHOICE" as const,qty: 2, type2: CardType.MECH,   desc: "Production is equal to the largest production among your cards with a different dice roll value from this card."},
    { name: CardName.THOUGHT_CURATOR,   type: CardType.BIO,     culture_clash: true,    cost: 9, prod: "DYNAMIC" as const,  roll: "CHOICE" as const,qty: 2, type2: CardType.SPIRIT, desc: "Production is equal to the number of different dice roll values you have with bios."}
].map(card => [card.name, card]));

export enum CultureCardName {
    SLUMBERING = "Slumbering",
    TECHNICAL = "Technical",
    TRANSCENDENT = "Transcendent",
    UNITED = "United",
    VORACIOUS = "Voracious",
    MERCANTILE = "Mercantile",
    MOBILE = "Mobile",
    MONARCHICAL = "Monarchical",
    MYSTICAL = "Mystical",
    NOMADIC = "Nomadic",
    ORTHODOX = "Orthodox",
    OSTENTATIOUS = "Ostentatious",
    PRESCIENT = "Prescient",
    PSYCHIC = "Psychic",
    RESOURCEFUL = "Resourceful",
    SCIENTISTIC = "Scientistic",
    HERDING = "Herding",
    INDUSTRIOUS = "Industrious",
    INNOVATIVE = "Innovative",
    MARTIAL = "Martial",
    MECHANIZED = "Mechanized",
}

export interface CultureCard {
    name: CultureCardName;
    ability: string;
    full_ability: string;
    tips: string;
}

export const CULTURE_CARD_DATA: Map<CultureCardName, CultureCard>  = new Map([
    { name: CultureCardName.SLUMBERING,     ability: "Reveal this culture card only at the start of your first turn. When you reveal this card, pay 8 credits. Your cards have +1 production.",                 full_ability: "You can only reveal this card at the start of your first turn and must pay 8 credits to do so. Then, all your cards have +1 production.",                                                                                                                                                                                                                                                                                                        tips: "This is the classic \"slow start, exponential growth\" card. Good to pair with another income generator, because you need to get cards ASAP after revealing this." },
    { name: CultureCardName.TECHNICAL,      ability: "Mechs that you don't already own cost 1 less for you.",                                                                                                   full_ability: "You have a 1 Credit discount to buy any mech that isn't the same as one you already own. Two mechs are considered the same if they have the same name. (Their other stats don't matter.)",                                                                                                                                                                                                                                                       tips: "Combos well with World Forger and other cards which benefit from a diverse range of roll values." },
    { name: CultureCardName.TRANSCENDENT,   ability: "Bios are also spirits for you.",                                                                                                                          full_ability: "All Bio cards become Spirits in addition to their other types.",                                                                                                                                                                                                                                                                                                                                                                                 tips: "This counts for discounts in the build pool, as well as abilities that count whether a card is a Spirit." },
    { name: CultureCardName.UNITED,         ability: "Cards cost 1 less for you for each copy of that card you already own.",                                                                                   full_ability: "For each copy of a card you have, those cards cost 1 credit less for you.",                                                                                                                                                                                                                                                                                                                                                                      tips: "Great in combination with a lot of ways to cycle the build pool." },
    { name: CultureCardName.VORACIOUS,      ability: "Once per turn, you may discard a card to get 1 and build another card.",                                                                                  full_ability: "Each turn, you can discard one of your cards in your tableau (not culture cards). If you do you can get 1 Credit and immediately build another card.",                                                                                                                                                                                                                                                                                           tips: "Early game, you would mostly use this for its credit, but later on it is quite valuable to upgrade your smaller cards with spare credits." },
    { name: CultureCardName.MERCANTILE,     ability: "If a player shifts their production roll on their turn, get 1.",                                                                                          full_ability: "If any player shifts their production roll on their turn, through and action or an ability, you get 1 Credit.",                                                                                                                                                                                                                                                                                                                                  tips: "If you see everyone getting a Seraph Gate or similar, this might be a good choice." },
    { name: CultureCardName.MOBILE,         ability: "Place this card under a Mech. That card's roll value is -1 and +1 simultaneously.",                                                                       full_ability: "When you reveal this card, you must place it under a mech. That card's roll value becomes three (or two if on a 2 or 8) roll values at the same time: its current one, one greater and one less. For the sake of abilities, it is counted as having all three at once and so would count as three different roll values for cards like Transit Hub. It cannot be moved after it is played.",                                                     tips: "" },
    { name: CultureCardName.MONARCHICAL,    ability: "Reveal this card: Get 4.",                                                                                                                                full_ability: "Reveal this card and get 4 Credits.",                                                                                                                                                                                                                                                                                                                                                                                                            tips: "This card is much stronger the earlier you play it." },
    { name: CultureCardName.MYSTICAL,       ability: "You must pay 3 to reveal this card. Your non-spirit cards that have another spirit with the same roll value have +1 production.",                         full_ability: "You can only reveal this card if you pay 3 Credits. All your cards which do not have Spirit as one of its types, but you have another card which is a spirit and shares its roll value, get +1 production.",                                                                                                                                                                                                                                     tips: "This ability works best if you get a single spirit on a few roll values, and then build other cards with the same roll value." },
    { name: CultureCardName.NOMADIC,        ability: "Once per turn, when you cycle: Get 2. At the end of your turn, lose 1.",                                                                                  full_ability: "Each turn, if you cycle, you get 2 Credits. This counts for a cycle from any action or ability. You then lose 1 Credit at the end of your turn. If you don't have any you don't need to do this.",                                                                                                                                                                                                                                               tips: "One of the best cards to get extra credits each turn if you manage to spend all of them." },
    { name: CultureCardName.ORTHODOX,       ability: "Your Bio cards with 3 or more production have +1 production.",                                                                                            full_ability: "All of your Bio cards which have three or more production get +1 production.",                                                                                                                                                                                                                                                                                                                                                                   tips: "There are only a few Bio cards with enough production, so make sure you patrol them when they come up, or use another production buff to get your other bio cards into range for this ability." },
    { name: CultureCardName.OSTENTATIOUS,   ability: "Your cards with base cost of 7 or more have +1 production.",                                                                                              full_ability: "Any card you have that costs 7 Credits or more has +1 production.",                                                                                                                                                                                                                                                                                                                                                                              tips: "Remember that since you can apply buffs in any order, this means even if a discount reduces a card to below seven, it still gets the benefit." },
    { name: CultureCardName.PRESCIENT,      ability: "During your turn, you may look at the top card of each deck and treat them as if they were in the build pool.",                                           full_ability: "During your turn you can look at the top card of each deck. You may treat them as being in the build pool. That means you can build them, and count as in the build pool for Emulative and other such abilities.",                                                                                                                                                                                                                               tips: "" },
    { name: CultureCardName.PSYCHIC,        ability: "You can shift your production roll by 1.",                                                                                                                full_ability: "Each turn you can shift your production roll up or down by one. It cannot be increased to over 8 or less than 2.",                                                                                                                                                                                                                                                                                                                               tips: "" },
    { name: CultureCardName.RESOURCEFUL,    ability: "When you cycle as an action, you get an additional 2.",                                                                                                   full_ability: "When you cycle as an action, you get an extra 2 Credits. So you will receive 4 Credits total from that action. This does not count cycling from card abilities.",                                                                                                                                                                                                                                                                                tips: "This card is great early game, however later when you need actions to purchase cards it falls off." },
    { name: CultureCardName.SCIENTISTIC,    ability: "Reveal this card: You may build a card from the deck this turn.",                                                                                         full_ability: "When you reveal this card, you may search a card deck and choose one card to build from them. You need to shuffle both decks after doing so.",                                                                                                                                                                                                                                                                                                   tips: "This can be extremely powerful later in the game to pick up cards you really need. This is also the only card which can shuffle the deck in the game, so keep that in mind as well." },
    { name: CultureCardName.HERDING,        ability: "Cards cost 1 less for you if you have a card with +1 its roll value and another with -1 its roll value.",                                                 full_ability: "You have a 1 Credit discount on all cards in the build pool for which you already own a card with a roll value immediately above it and a card immediately below it. For example, if a card has a roll value of 4 and you already have cards with roll values of 3 and 5 respectively, you can buy the 4 roll value card with a discount. You are not able to use this ability for 2 roll value cards, or cards with a 2 or an 8 roll value.",   tips: "" },
    { name: CultureCardName.INDUSTRIOUS,    ability: "Once per turn, you may build a card which costs 1 or less.",                                                                                              full_ability: "Each turn, you can build a card which costs 1 or less Credit without using an action. You still need to pay for it if it costs 1 Credit.",                                                                                                                                                                                                                                                                                                       tips: "Great in combination with other purchase discounts." },
    { name: CultureCardName.INNOVATIVE,     ability: "Reveal this card: This turn, each time you build a card you get 1. On your next turn, hide this card; you cannot reveal it again until the turn after.",  full_ability: "This effectively means you can use the ability every second turn (at most). You get credits even if you buy something for free (due to Beacon Hub, for instance) and even if it doesn't use one of your actions. Once revealed, even if you hide it again Innovative still counts as one of your revealed culture cards.",                                                                                                                       tips: "Use the down-turns to cycle, and buy a lot on the turns you activate this card." },
    { name: CultureCardName.MARTIAL,        ability: "Once per turn, when you patrol: Get 2.",                                                                                                                  full_ability: "Once each turn, if you patrol a card you get 2 Credits. Patrolling is when you reserve a card, not when you build a patrolled card.",                                                                                                                                                                                                                                                                                                            tips: "Great if you can get a card which patrols, then patrol with it and build the patrolled card immediately." },
    { name: CultureCardName.MECHANIZED,     ability: "Bios are also Mechs for you.",                                                                                                                            full_ability: "All Bio cards become Mechs in addition to their other types.",                                                                                                                                                                                                                                                                                                                                                                                   tips: "This counts for discounts in the build pool, as well as abilities that count whether a card is a Mech." },
].map(card => [card.name, card]));
