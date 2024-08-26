import React, { useState } from 'react';
import Timer from './Timer';

const fishProbabilities = {
  common: 50,
  uncommon: 25,
  rare: 12,
  superRare: 6,
  epic: 4,
  legendary: 2,
  mythical: 1,
};

const baitInfluence = {
  common: { uncommon: 10, rare: 5, superRare: 2, epic: 1, legendary: 0.5, mythical: 0.1 },
  uncommon: { uncommon: 15, rare: 7, superRare: 3, epic: 1.5, legendary: 1, mythical: 0.2 },
  rare: { uncommon: 20, rare: 10, superRare: 5, epic: 3, legendary: 2, mythical: 0.5 },
  superRare: { uncommon: 25, rare: 15, superRare: 8, epic: 5, legendary: 3, mythical: 1 },
  epic: { uncommon: 30, rare: 20, superRare: 10, epic: 7, legendary: 5, mythical: 2 },
  legendary: { uncommon: 35, rare: 25, superRare: 15, epic: 10, legendary: 7, mythical: 3 },
  mythical: { uncommon: 40, rare: 30, superRare: 20, epic: 15, legendary: 10, mythical: 5 },
};

function FishingSection({ addCatchToInventory, removeFishFromInventory, inventory, selectedBait, setSelectedBait }) {
  const [isFishing, setIsFishing] = useState(false);
  const [catchResult, setCatchResult] = useState(null);

  const startFishing = () => {
    if (isFishing) return;
    setIsFishing(true);
    setCatchResult(null);
    const waitTime = Math.floor(Math.random() * 6) + 5;

    setTimeout(() => {
      const result = calculateCatch(selectedBait);
      setCatchResult(result);
      setIsFishing(false);
      addCatchToInventory(result);
      if (selectedBait) {
        removeFishFromInventory(selectedBait);
        setSelectedBait(null);
      }
    }, waitTime * 1000);
  };

  const calculateCatch = (bait) => {
    let totalProbability = 0;
    for (let type in fishProbabilities) {
      const baseChance = fishProbabilities[type];
      const baitBonus = bait ? baitInfluence[bait][type] || 0 : 0;
      totalProbability += baseChance + baitBonus;
    }

    const randomValue = Math.random() * totalProbability;
    let accumulatedProbability = 0;

    for (let type in fishProbabilities) {
      const baseChance = fishProbabilities[type];
      const baitBonus = bait ? baitInfluence[bait][type] || 0 : 0;
      accumulatedProbability += baseChance + baitBonus;
      if (randomValue <= accumulatedProbability) {
        return type;
      }
    }

    return "common";
  };

  return (
    <div className="fishing-section">
      <button onClick={startFishing} disabled={isFishing}>
        Fish
      </button>
      <div>
        <p>Bait Selected: {selectedBait ? selectedBait.charAt(0).toUpperCase() + selectedBait.slice(1) : 'None'}</p>
        <button onClick={() => setSelectedBait(null)} disabled={!selectedBait}>
          Clear Bait
        </button>
      </div>
      {isFishing && <Timer />}
      {catchResult && <div id="timer">You caught a {catchResult} fish!</div>}
    </div>
  );
}

export default FishingSection;
