/**
 * Cosmos Empires - Card Database
 */
const CARD_DATA = [
    { name: "Nautilus", type: "BIO", cost: 1, prod: 2, roll: 2, qty: 7 },
    { name: "M.E.R.V", type: "MECH", cost: 5, prod: 3, roll: 4, qty: 7 },
    { name: "Nebula Whale", type: "SPIRIT", cost: 2, prod: 2, roll: 6, qty: 5 },
    { name: "Ancient Gate", type: "MECH", cost: 3, prod: "DYNAMIC", roll: 7, qty: 5,
      desc: "Prod = Size of your largest set of a single card name." },
    { name: "World Ship", type: "MECH", cost: 6, prod: 4, roll: 3, qty: 5 },
    { name: "Librarian", type: "SPIRIT", cost: 5, prod: 3, roll: 5, qty: 7 },
    { name: "Collective", type: "SPIRIT", cost: 8, prod: "DYNAMIC", roll: 6, qty: 3,
      desc: "Prod = 2 * (Number of unique card names where you own > 1 copy)." },
    { name: "Beacon Hub", type: "MECH", cost: 4, prod: 1, roll: 8, qty: 5 },
    { name: "Yggdrasil", type: "BIO", cost: 7, prod: "DYNAMIC", roll: 3, qty: 5,
      desc: "Prod = Number of BIO cards you own (counts itself)." },
    { name: "Fabricator Belt", type: "MECH", cost: 7, prod: 1, roll: 5, qty: 5 },
    { name: "T-Wing", type: "MECH", cost: 1, prod: 1, roll: 7, qty: 5 },
    { name: "Transit Hub", type: "MECH", cost: 7, prod: "DYNAMIC", roll: 8, qty: 5,
      desc: "Prod = Number of unique dice roll values you own. Max 7." },
    { name: "Seraph Gate", type: "BIO", cost: 5, prod: 1, roll: 4, qty: 5 },
    { name: "Discovery", type: "MECH", cost: 2, prod: 1, roll: 6, qty: 5 },
    { name: "Deepspace Scouts", type: "MECH", cost: 3, prod: 1, roll: 7, qty: 5 },
    { name: "Darkspace Hub", type: "MECH", cost: 6, prod: 4, roll: "CHOICE", qty: 5,
      desc: "On purchase, choose a roll value (2-8). Cannot match a roll value you already own." }
].sort((a, b) => a.name.localeCompare(b.name));
