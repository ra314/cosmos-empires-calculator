import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { CARD_DATA, CardName, CardType, CULTURE_CARD_DATA } from './data';
import { ScoringEngine, PlayerManager } from './scoring_engine';

/**
 * Cosmos Empires - UI Controller
 */

// --- Helpers ---

// Groups computed cards by name for the "Stack" view in the UI
const groupCardsForDisplay = (computedCards) => {
    const groups = new Map();
    
    computedCards.forEach(card => {
        if (!groups.has(card.name)) {
            groups.set(card.name, {
                data: CARD_DATA.get(card.name),
                computed: [],
                qty: 0,
                totalProd: 0
            });
        }
        const group = groups.get(card.name);
        group.computed.push(card);
        group.qty += 1;
        group.totalProd += card.currentProduction;
    });

    return groups;
};

const getScore = (computedCards) => {
    return computedCards.reduce((acc, card) => acc + card.currentProduction, 0);
};

const getProductionForRoll = (computedCards, roll) => {
    return computedCards.reduce((acc, card) => {
        const hits = card.effectiveRolls.has(roll);
        return acc + (hits ? card.currentProduction : 0);
    }, 0);
};

/**
 * Simplified Check:
 * Returns true if ANY player has ANY expansion content (Culture Clash cards OR active Culture Cards).
 */
const isExpansionInUse = (players) => {
    return players.some(player => {
        // Check 1: Do they have any active Culture Cards (e.g. Dictatorship)?
        if (player.tableau.activeCultureCards.size > 0) return true;

        // Check 2: Do they have any cards marked culture_clash=true?
        return player.tableau.ownedCards.some(pCard => {
            const cardData = CARD_DATA.get(pCard.cardName);
            return cardData && cardData.culture_clash;
        });
    });
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

// --- PlayerDetail ---

function PlayerDetail({ player, computedCards, onAddCard, onRename, onRemoveCard, onToggleCulture, showDelta, cultureClashEnabled }) {
    
    const typeConfig = { 
        BIO: { color: 'emerald', icon: '🌿' }, 
        MECH: { color: 'sky', icon: '⚙️' }, 
        SPIRIT: { color: 'violet', icon: '✨' } 
    };

    const getCardStyle = (typesSet) => {
        const types = Array.from(typesSet).sort();
        const baseColor = typeConfig[types[0]]?.color || 'slate';

        if (types.length === 1) return `bg-${baseColor}-700 border-2 border-${baseColor}-500`;
        
        if (types.length === 2) {
            const c1 = typeConfig[types[0]]?.color || 'slate';
            const c2 = typeConfig[types[1]]?.color || 'slate';
            return `bg-gradient-to-r from-${c1}-700 to-${c2}-700 border-2 border-${c1}-500`;
        }

        if (types.length === 3) {
            const c1 = typeConfig[types[0]]?.color || 'slate';
            const c2 = typeConfig[types[1]]?.color || 'slate';
            const c3 = typeConfig[types[2]]?.color || 'slate';
            return `bg-gradient-to-r from-${c1}-700 via-${c2}-700 to-${c3}-700 border-2 border-${c1}-500`;
        }
        return 'bg-slate-700 border-2 border-slate-500';
    };

    const getBadgeStyle = (type) => {
        const color = typeConfig[type]?.color || 'slate';
        return `bg-${color}-600 border border-${color}-400`;
    };

    // Filter available cards based on expansion toggle
    const cardList = Array.from(CARD_DATA.values())
        .filter(card => cultureClashEnabled || !card.culture_clash)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const cultureList = Array.from(CULTURE_CARD_DATA.values())
        .sort((a, b) => a.name.localeCompare(b.name));

    const groupedCards = groupCardsForDisplay(computedCards);

    // Determine occupied rolls for Darkspace Hub
    const darkspaceHub = computedCards.find(c => c.name === CardName.DARKSPACE_HUB);
    const darkspaceRoll = darkspaceHub ? Array.from(darkspaceHub.effectiveRolls)[0] : null;

    return (
        <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">

            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300 border-b border-indigo-500/20 pb-2">Your Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from(groupedCards.entries()).map(([name, group]) => {
                        const effectiveTypes = ScoringEngine.calculateEffectiveTypes(group.data, player.tableau);
                        return (
                            <div key={name} className={`${getCardStyle(effectiveTypes)} p-2 px-3 rounded flex flex-col justify-center`}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <div className="flex gap-0.5">
                                            {Array.from(effectiveTypes).sort().map(t => (
                                                <span key={t} className="text-xs" title={t}>{typeConfig[t]?.icon}</span>
                                            ))}
                                        </div>
                                        <span className="font-bold text-sm truncate">{name}</span>
                                        {group.totalProd > 0 && <ProdBadge value={group.totalProd} />}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-lg shrink-0">×{group.qty}</span>
                                        <button onClick={() => onRemoveCard(player.id, group.computed[group.computed.length-1].instanceId)} className="bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold shadow-sm shrink-0">−</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {cultureClashEnabled && (
                <div className="mb-10">
                    <h3 className="text-xl font-semibold mb-3 text-indigo-300 border-b border-indigo-500/20 pb-2">Active Culture Cards</h3>
                    <div className="flex flex-wrap gap-2">
                        {cultureList.map(cc => {
                            const isActive = player.tableau.activeCultureCards.has(cc.name);
                            return (
                                <button
                                    key={cc.name}
                                    onClick={() => onToggleCulture(player.id, cc.name)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                                        isActive 
                                        ? 'bg-amber-600 border-amber-400 text-white' 
                                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                                    }`}
                                >
                                    {cc.name}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-300 border-b border-indigo-500/20 pb-2">Add Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cardList.map(card => {
                        const effectiveTypes = ScoringEngine.calculateEffectiveTypes(card, player.tableau);
                        const effectiveTypesArray = Array.from(effectiveTypes).sort();

                        let deltaValue = 0;
                        if (showDelta) {
                            const currentScore = getScore(computedCards);
                            const hypoTableau = PlayerManager.addCard(player.tableau, card.name, { selectedRoll: card.roll === "CHOICE" ? 2 : undefined });
                            const hypoComputed = ScoringEngine.calculate(hypoTableau);
                            deltaValue = getScore(hypoComputed) - currentScore;
                        }

                        let isConflicting = false;
                        if (darkspaceRoll && card.roll !== "CHOICE" && card.roll === darkspaceRoll) {
                            isConflicting = true;
                        }

                        return (
                            <button 
                                key={card.name} 
                                onClick={() => !isConflicting && onAddCard(card.name)} 
                                disabled={isConflicting}
                                className={`${
                                    isConflicting 
                                        ? 'bg-slate-600 opacity-50 cursor-not-allowed' 
                                        : getCardStyle(effectiveTypes) + ' hover:brightness-110'
                                } p-3 rounded text-left transition`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl flex flex-col gap-0 leading-none">
                                            {effectiveTypesArray.map(t => <span key={t}>{typeConfig[t]?.icon}</span>)}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-sm">{card.name}</div>
                                                {isConflicting && <span className="text-lg">🚫</span>}
                                                {!isConflicting && deltaValue > 0 && <ProdBadge value={deltaValue} />}
                                            </div>
                                            <div className="text-xs opacity-90">Prod: {card.prod} | Roll: {card.roll}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        {effectiveTypesArray.map(t => (
                                            <span key={t} className={`${getBadgeStyle(t)} px-2 py-0.5 rounded text-[10px] font-bold`}>{t}</span>
                                        ))}
                                    </div>
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
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [darkspaceModal, setDarkspaceModal] = useState(null);
    const [selectedRoll, setSelectedRoll] = useState(2);
    const [history, setHistory] = useState([]);
    const [showDelta, setShowDelta] = useState(true);
    
    // Toggle State
    const [cultureClashEnabled, setCultureClashEnabled] = useState(false);

    // Helpers
    const updatePlayers = (newPlayers) => {
        setHistory(prev => [...prev.slice(-20), players]);
        setPlayers(newPlayers);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setPlayers(previous);
        setHistory(prev => prev.slice(0, -1));
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                handleUndo();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history]);

    // Action Handlers
    const addPlayer = () => {
        if (players.length >= 8) return;
        const newPlayer = { 
            id: Date.now(), 
            name: `Player ${players.length + 1}`, 
            tableau: PlayerManager.createTableau() 
        };
        updatePlayers([...players, newPlayer]);
        if (!selectedPlayerId) setSelectedPlayerId(newPlayer.id);
    };

    const renamePlayer = (id, newName) => {
        setPlayers(curr => curr.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const addCard = (playerId, cardName, choices = {}) => {
        const playerIndex = players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;
        
        const player = players[playerIndex];
        const newTableau = PlayerManager.addCard(player.tableau, cardName, choices);
        
        const newPlayers = [...players];
        newPlayers[playerIndex] = { ...player, tableau: newTableau };
        updatePlayers(newPlayers);
        setDarkspaceModal(null);
    };

    const removeCard = (playerId, instanceId) => {
        const playerIndex = players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const player = players[playerIndex];
        const newTableau = PlayerManager.removeCard(player.tableau, instanceId);

        const newPlayers = [...players];
        newPlayers[playerIndex] = { ...player, tableau: newTableau };
        updatePlayers(newPlayers);
    };

    const toggleCulture = (playerId, cultureCardName) => {
        const playerIndex = players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const player = players[playerIndex];
        const newTableau = PlayerManager.toggleCulture(player.tableau, cultureCardName);

        const newPlayers = [...players];
        newPlayers[playerIndex] = { ...player, tableau: newTableau };
        updatePlayers(newPlayers);
    };

    // Derived State
    const scoredPlayers = useMemo(() => {
        return players.map(p => {
            const computed = ScoringEngine.calculate(p.tableau);
            return { ...p, computed, score: getScore(computed) };
        }).sort((a, b) => b.score - a.score);
    }, [players]);

    // Simplified Logic: Are any expansion cards actually in use right now?
    const expansionInUse = useMemo(() => isExpansionInUse(players), [players]);

    // Handle the Toggle logic
    // Can turn ON anytime. Can only turn OFF if not in use.
    const isToggleLocked = cultureClashEnabled && expansionInUse;

    const handleToggleExpansion = () => {
        if (isToggleLocked) return;
        setCultureClashEnabled(!cultureClashEnabled);
    };
    
    // Modal helpers
    const getModalOccupiedRolls = () => {
        if (!darkspaceModal) return new Set();
        if (darkspaceModal.cardName === CardName.DARKSPACE_HUB) {
            const p = scoredPlayers.find(p => p.id === darkspaceModal.playerId);
            if (!p) return new Set();
            const rolls = new Set();
            p.computed.forEach(c => c.effectiveRolls.forEach(r => rolls.add(r)));
            return rolls;
        }
        return new Set();
    };

    return (
        <div className="min-h-screen p-4">
            <div className="flex justify-center items-center mb-8 gap-8">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-indigo-400 mb-2">COSMOS EMPIRES</h1>
                    <p className="text-slate-400">Score Tracker</p>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6">
                
                {/* Left Sidebar: Leaderboard & Controls */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">
                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Leaderboard</h2>
                        <div className="space-y-2">
                            {scoredPlayers.map((p) => (
                                <div key={p.id} className={`flex items-center gap-2 p-3 rounded ${selectedPlayerId === p.id ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-indigo-600/50'}`}>
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => renamePlayer(p.id, e.target.value)}
                                        onClick={() => setSelectedPlayerId(p.id)}
                                        className="bg-transparent font-semibold text-lg truncate min-w-0 flex-1 border-b border-transparent hover:border-indigo-300 focus:border-indigo-400 focus:outline-none text-white"
                                    />
                                    <span className="text-lg font-bold text-indigo-400 shrink-0">{p.score}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={addPlayer} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">Add Player</button>
                        <button onClick={handleUndo} disabled={history.length === 0} className={`w-full mt-2 bg-yellow-600 text-white font-bold py-2 rounded ${history.length === 0 && 'opacity-30'}`}>Undo</button>
                        
                        <div className="space-y-2 mt-4">
                             {/* Delta Toggle */}
                             <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700">
                                <span className="text-[10px] font-semibold text-indigo-300 uppercase">Delta</span>
                                <button onClick={() => setShowDelta(!showDelta)} className={`w-10 h-5 rounded-full transition-colors ${showDelta ? 'bg-indigo-500' : 'bg-slate-600'} relative`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showDelta ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Simplified Culture Clash Toggle */}
                            <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700 group relative">
                                <span className="text-[10px] font-semibold text-indigo-300 uppercase">Culture Clash</span>
                                <button 
                                    onClick={handleToggleExpansion}
                                    disabled={isToggleLocked}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${
                                        cultureClashEnabled ? 'bg-indigo-500' : 'bg-slate-600'
                                    } ${isToggleLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${cultureClashEnabled ? 'left-5' : 'left-1'}`} />
                                </button>

                                {isToggleLocked && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-red-500 rounded px-2 py-1 text-xs text-red-300 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                                        Remove all culture clash cards to disable.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Player Detail View */}
                <div className="lg:col-span-4">
                    {selectedPlayerId ? (
                        <PlayerDetail 
                            player={scoredPlayers.find(p => p.id === selectedPlayerId)} 
                            computedCards={scoredPlayers.find(p => p.id === selectedPlayerId).computed}
                            onRename={renamePlayer}
                            onAddCard={(name) => {
                                const card = CARD_DATA.get(name);
                                if (card.roll === "CHOICE") {
                                    setDarkspaceModal({ playerId: selectedPlayerId, cardName: name });
                                } else {
                                    addCard(selectedPlayerId, name);
                                }
                            }}
                            onRemoveCard={removeCard}
                            onToggleCulture={toggleCulture}
                            showDelta={showDelta}
                            cultureClashEnabled={cultureClashEnabled}
                        />
                    ) : (
                        <div className="bg-slate-800 rounded-lg p-12 text-center border border-indigo-500/30 text-slate-400 text-xl">Select a player to manage cards</div>
                    )}
                </div>

                {/* Right Sidebar: Roll Payout Calculator */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 rounded-lg p-4 border border-indigo-500/30 h-full">
                        <div className="font-semibold text-indigo-300 mb-3 text-center">Roll Payout:</div>
                        <div className="flex gap-2 flex-wrap justify-center mb-4">
                            {[2,3,4,5,6,7,8].map(r => (
                                <button key={r} onClick={() => setSelectedRoll(r)} className={`w-10 h-10 rounded font-bold ${selectedRoll === r ? "bg-indigo-600 border-2 border-indigo-400" : "bg-slate-700"}`}>{r}</button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {scoredPlayers.map(p => (
                                <div key={p.id} className={`flex justify-between p-2 rounded text-lg ${selectedPlayerId === p.id ? 'bg-indigo-900/40' : 'bg-slate-900/30'}`}>
                                    <span className="truncate mr-2">{p.name}</span>
                                    <span className="font-bold text-indigo-400">{getProductionForRoll(p.computed, selectedRoll)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {darkspaceModal && (
                <DarkspaceModal 
                    onSelect={(roll) => addCard(darkspaceModal.playerId, darkspaceModal.cardName, { selectedRoll: roll })}
                    onClose={() => setDarkspaceModal(null)}
                    occupied={getModalOccupiedRolls()}
                />
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);