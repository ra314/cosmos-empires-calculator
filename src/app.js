/**
 * Cosmos Empires - UI Controller
 */
const { useState, useMemo, useEffect } = React;

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

const ProdBadge = ({ value, animate = false }) => (
    <span className={`bg-emerald-500 text-[10px] text-emerald-950 font-black px-1.5 py-0.5 rounded shrink-0 flex items-center justify-center min-w-[24px] ${animate ? 'animate-pulse' : ''}`}>
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

function PlayerDetail({ player, onAddCard, showDelta, setShowDelta }) {
    const typeColors = { BIO: 'bg-emerald-700 border-2 border-emerald-500', MECH: 'bg-sky-700 border-2 border-sky-500', SPIRIT: 'bg-violet-700 border-2 border-violet-500' };
    const typeIcons = { BIO: '🌿', MECH: '⚙️', SPIRIT: '✨' };
    const typeBadgeStyles = { BIO: 'bg-emerald-600 border border-emerald-400', MECH: 'bg-sky-600 border border-sky-400', SPIRIT: 'bg-violet-600 border border-violet-400' };

    const cardList = Array.from(CARD_DATA.values());

    return (
        <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-indigo-400">{player.name}</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-semibold text-indigo-300 uppercase">Delta</span>
                        <button onClick={() => setShowDelta(!showDelta)} className={`w-10 h-5 rounded-full transition-colors ${showDelta ? 'bg-indigo-500' : 'bg-slate-600'} relative`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showDelta ? 'left-5' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

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
                                    <span className="font-bold text-lg shrink-0">×{rolls.length}</span>
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

                        return (
                            <button key={card.name} onClick={() => onAddCard(card.name)} className={`${typeColors[card.type]} hover:brightness-110 p-3 rounded text-left transition`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl">{typeIcons[card.type]}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-sm">{card.name}</div>
                                                {deltaValue > 0 && <ProdBadge value={deltaValue} animate={true} />}
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

    const handleUndo = () => {
        if (!undoAction) return;
        const { action, playerId, cardName } = undoAction;
        setPlayers(curr => curr.map(p => {
            if (p.id !== playerId) return p;
            const newCards = { ...p.cards };
            if (action === "add" && newCards[cardName]) {
                newCards[cardName].pop();
                if (newCards[cardName].length === 0) delete newCards[cardName];
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
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold text-indigo-400 mb-2">COSMOS EMPIRES</h1>
                <p className="text-slate-400">Score Tracker</p>
            </header>

            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">
                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Leaderboard</h2>
                        <div className="space-y-2">
                            {leaderboard.map((p) => (
                                <div key={p.id} onClick={() => setSelectedPlayer(p.id)} className={`flex items-center justify-between p-3 rounded cursor-pointer ${selectedPlayer === p.id ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-indigo-600/50'}`}>
                                    <span className="font-semibold text-sm">{p.name}</span>
                                    <span className="text-2xl font-bold text-indigo-400">{p.score}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={addPlayer} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">Add Player</button>
                        <button onClick={handleUndo} disabled={!undoAction} className={`w-full mt-2 bg-yellow-600 text-white font-bold py-2 rounded ${!undoAction && 'opacity-30'}`}>Undo</button>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    {selectedPlayer ? (
                        <PlayerDetail 
                            player={players.find(p => p.id === selectedPlayer)} 
                            onAddCard={(name) => {
                                const card = CARD_DATA.get(name);
                                if (card.roll === "CHOICE") setDarkspaceModal({ playerId: selectedPlayer, cardName: name });
                                else addCard(selectedPlayer, name, card.roll);
                            }}
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
                                <div key={p.id} className={`flex justify-between p-2 rounded text-xs ${selectedPlayer === p.id ? 'bg-indigo-900/40' : 'bg-slate-900/30'}`}>
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