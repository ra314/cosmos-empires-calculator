import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { CARD_DATA } from './data';
import { calculateScore, calculateProductionForRoll, calcDynProd } from './logic';


/**
 * Cosmos Empires - UI Controller
 */
// --- Helpers to bridge UI State to Logic.js ---

// Converts UI state { "CardName": [rolls] } to the Map structure logic.js expects
const sync = (playerCardState) => {
    const cardsMap = new Map();
    
    Object.entries(playerCardState).forEach(([name, rolls]) => {
        const data = CARD_DATA.get(name);
        if (data) {
            cardsMap.set(name, {
                data: data,
                qty: rolls.length,
                roll: data.roll === "CHOICE" ? rolls : []
            });
        }
    });

    return { cards: cardsMap };
};

// Calculates the contribution of a single card type for the UI badges
const calculateCardContribution = (cardName, rolls, allCards) => {
    const synced = sync(allCards);
    const instance = synced.cards.get(cardName);
    if (!instance) return 0;
    
    // This replicates the logic.js calculation for a single card type
    const prod = (typeof instance.data.prod === 'number') 
        ? instance.data.prod 
        : calcDynProd(cardName, synced);
    
    return prod * instance.qty;
};

// Gets all roll values currently claimed by a player (for Darkspace logic)
const getPlayerRollValues = (player) => {
    if (!player) return new Set();
    const values = new Set();
    Object.entries(player.cards).forEach(([name, rolls]) => {
        const data = CARD_DATA.get(name);
        if (data.roll === "CHOICE") {
            rolls.forEach(r => values.add(r));
        } else {
            values.add(data.roll);
        }
    });
    return values;
};

// --- Helper Components ---

const ProdBadge = ({ value }) => (
    <span className={`bg-emerald-500 text-sm text-emerald-950 font-black px-1.5 py-0.5 rounded shrink-0 flex items-center justify-center min-w-[24px]`}>
        +{value}
    </span>
);

function DarkspaceModal({ onSelect, onClose, occupied }) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border-2 border-indigo-500">
                <h3 className="text-2xl font-bold text-indigo-400 mb-4 text-center">Assign Roll Value</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {[2,3,4,5,6,7,8].map(roll => (
                        <button 
                            key={roll} 
                            onClick={() => !occupied.has(roll) && onSelect(roll)} 
                            disabled={occupied.has(roll)} 
                            className={`py-3 px-4 rounded font-bold text-lg ${!occupied.has(roll) ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                            {roll}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
            </div>
        </div>
    );
}

// --- Updated PlayerDetail with editable name ---

function PlayerDetail({ player, onAddCard, onRename, onRemoveCard, showDelta, setShowDelta }) {
    const typeColors = { BIO: 'bg-emerald-700 border-2 border-emerald-500', MECH: 'bg-sky-700 border-2 border-sky-500', SPIRIT: 'bg-violet-700 border-2 border-violet-500' };
    const typeIcons = { BIO: '🌿', MECH: '⚙️', SPIRIT: '✨' };
    const typeBadgeStyles = { BIO: 'bg-emerald-600 border border-emerald-400', MECH: 'bg-sky-600 border border-sky-400', SPIRIT: 'bg-violet-600 border border-violet-400' };

    const cardList = Array.from(CARD_DATA.values());
    const occupiedRolls = getPlayerRollValues(player);

    return (
        <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">

            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300 border-b border-indigo-500/20 pb-2">Your Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(player.cards).map(([name, rolls]) => {
                        const card = CARD_DATA.get(name);
                        const contribution = calculateCardContribution(name, rolls, player.cards);
                        return (
                            <div key={name} className={`${typeColors[card.type]} p-2 px-3 rounded flex flex-col justify-center`}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-bold text-sm truncate">{name}</span>
                                        {contribution > 0 && <ProdBadge value={contribution} />}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-lg shrink-0">×{rolls.length}</span>
                                        <button onClick={() => onRemoveCard(player.id, name)} className="bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold shadow-sm shrink-0">−</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-300 border-b border-indigo-500/20 pb-2">Add Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cardList.map(card => {
                        let deltaValue = 0;
                        if (showDelta) {
                            const currentScore = calculateScore(sync(player.cards));
                            const hypoCards = JSON.parse(JSON.stringify(player.cards));
                            if (!hypoCards[card.name]) hypoCards[card.name] = [];
                            hypoCards[card.name].push(card.roll === "CHOICE" ? 0 : card.roll);
                            deltaValue = calculateScore(sync(hypoCards)) - currentScore;
                        }

                        // Check if this card's roll value conflicts with occupied rolls
                        const isConflicting = card.roll !== "CHOICE" && occupiedRolls.has(card.roll);

                        return (
                            <button 
                                key={card.name} 
                                onClick={() => !isConflicting && onAddCard(card.name)} 
                                disabled={isConflicting}
                                className={`${
                                    isConflicting 
                                        ? 'bg-slate-600 opacity-50 cursor-not-allowed' 
                                        : typeColors[card.type] + ' hover:brightness-110'
                                } p-3 rounded text-left transition`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl">{typeIcons[card.type]}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-sm">{card.name}</div>
                                                {isConflicting && <span className="text-lg">🚫</span>}
                                                {!isConflicting && deltaValue > 0 && <ProdBadge value={deltaValue} />}
                                            </div>
                                            <div className="text-xs opacity-90">Prod: {card.prod} | Roll: {card.roll}</div>
                                        </div>
                                    </div>
                                    <span className={`${typeBadgeStyles[card.type]} px-2 py-1 rounded text-[10px] font-bold`}>{card.type}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// --- Main App Component ---

function App() {
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [darkspaceModal, setDarkspaceModal] = useState(null);
    const [selectedRoll, setSelectedRoll] = useState(2);
    const [undoAction, setUndoAction] = useState(null);
    const [showDelta, setShowDelta] = useState(true);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && undoAction) {
                handleUndo();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undoAction]);

    const addPlayer = () => {
        if (players.length >= 8) return;
        setPlayers([...players, { id: Date.now(), name: `Player ${players.length + 1}`, cards: {} }]);
    };

    const renamePlayer = (id, newName) => {
        setPlayers(curr => curr.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const addCard = (playerId, cardName, darkspaceRoll = null) => {
        setPlayers(curr => curr.map(p => {
            if (p.id !== playerId) return p;
            const newCards = { ...p.cards };
            if (!newCards[cardName]) newCards[cardName] = [];
            newCards[cardName].push(darkspaceRoll);
            return { ...p, cards: newCards };
        }));
        setUndoAction({ action: "add", playerId, cardName });
        setDarkspaceModal(null);
    };

    const removeCard = (playerId, cardName) => {
        setPlayers(curr => curr.map(p => {
            if (p.id !== playerId) return p;
            const newCards = { ...p.cards };
            if (newCards[cardName]) {
                newCards[cardName].pop(); // Remove the last card instance
                if (newCards[cardName].length === 0) {
                    delete newCards[cardName]; // Remove the card if no instances left
                }
            }
            return { ...p, cards: newCards };
        }));
        setUndoAction({ action: "remove", playerId, cardName });
    };

    const handleUndo = () => {
        if (!undoAction) return;
        const { action, playerId, cardName } = undoAction;
        setPlayers(curr => curr.map(p => {
            if (p.id !== playerId) return p;
            const newCards = { ...p.cards };
            if (action === "add" && newCards[cardName]) {
                newCards[cardName].pop();
                if (newCards[cardName].length === 0) delete newCards[cardName];
            } else if (action === "remove") {
                if (!newCards[cardName]) newCards[cardName] = [];
                newCards[cardName].push(CARD_DATA.get(cardName).roll === "CHOICE" ? 0 : CARD_DATA.get(cardName).roll);
            }
            return { ...p, cards: newCards };
        }));
        setUndoAction(null);
    };

    const leaderboard = useMemo(() => {
        return players
            .map(p => ({ ...p, score: calculateScore(sync(p.cards)) }))
            .sort((a, b) => b.score - a.score);
    }, [players]);

    return (
        <div className="min-h-screen p-4">
                    <div className="flex justify-center items-center mb-8 gap-8">
                        <div className="text-center">
                <h1 className="text-5xl font-bold text-indigo-400 mb-2">COSMOS EMPIRES</h1>
                <p className="text-slate-400">Score Tracker</p>
                        </div>
                        <a
                            href="https://github.com/ra314/cosmos-empires-calculator"
                            target="_blank"
                    rel="noopener noreferrer" 
                            className="github-link flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition"
                            title="View on GitHub"
                        >
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="text-sm">GitHub</span>
                        </a>
                    </div>

            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">
                                <h2 className="text-2xl font-bold text-indigo-400 mb-4">Leaderboard</h2>
                        <div className="space-y-2">
                            {leaderboard.map((p) => (
                                <div key={p.id} className={`flex items-center gap-2 p-3 rounded ${selectedPlayer === p.id ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-indigo-600/50'}`}>
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => renamePlayer(p.id, e.target.value)}
                                        onClick={() => setSelectedPlayer(p.id)}
                                        className="bg-transparent font-semibold text-lg truncate min-w-0 flex-1 border-b border-transparent hover:border-indigo-300 focus:border-indigo-400 focus:outline-none text-white"
                                    />
                                    <span className="text-lg font-bold text-indigo-400 shrink-0">{p.score}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={addPlayer} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">Add Player</button>
                        <button onClick={handleUndo} disabled={!undoAction} className={`w-full mt-2 bg-yellow-600 text-white font-bold py-2 rounded ${!undoAction && 'opacity-30'}`}>Undo</button>
                        <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700 mt-3">
                            <span className="text-[10px] font-semibold text-indigo-300 uppercase">Delta</span>
                            <button onClick={() => setShowDelta(!showDelta)} className={`w-10 h-5 rounded-full transition-colors ${showDelta ? 'bg-indigo-500' : 'bg-slate-600'} relative`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showDelta ? 'left-5' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    {selectedPlayer ? (
                        <PlayerDetail 
                            player={players.find(p => p.id === selectedPlayer)} 
                            onRename={renamePlayer}
                            onAddCard={(name) => {
                                const card = CARD_DATA.get(name);
                                if (card.roll === "CHOICE") setDarkspaceModal({ playerId: selectedPlayer, cardName: name });
                                else addCard(selectedPlayer, name, card.roll);
                            }}
                            onRemoveCard={removeCard}
                            showDelta={showDelta}
                            setShowDelta={setShowDelta}
                        />
                    ) : (
                        <div className="bg-slate-800 rounded-lg p-12 text-center border border-indigo-500/30 text-slate-400 text-xl">Select a player to manage cards</div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-800 rounded-lg p-4 border border-indigo-500/30 h-full">
                        <div className="font-semibold text-indigo-300 mb-3 text-center">Roll Payout:</div>
                        <div className="flex gap-2 flex-wrap justify-center mb-4">
                            {[2,3,4,5,6,7,8].map(r => (
                                <button key={r} onClick={() => setSelectedRoll(r)} className={`w-10 h-10 rounded font-bold ${selectedRoll === r ? "bg-indigo-600 border-2 border-indigo-400" : "bg-slate-700"}`}>{r}</button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {players.map(p => (
                                <div key={p.id} className={`flex justify-between p-2 rounded text-lg ${selectedPlayer === p.id ? 'bg-indigo-900/40' : 'bg-slate-900/30'}`}>
                                    <span className="truncate mr-2">{p.name}</span>
                                    <span className="font-bold text-indigo-400">+{calculateProductionForRoll(sync(p.cards), selectedRoll)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {darkspaceModal && (
                <DarkspaceModal 
                    onSelect={(roll) => addCard(darkspaceModal.playerId, darkspaceModal.cardName, roll)}
                    onClose={() => setDarkspaceModal(null)}
                    occupied={getPlayerRollValues(players.find(p => p.id === darkspaceModal.playerId))}
                />
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);