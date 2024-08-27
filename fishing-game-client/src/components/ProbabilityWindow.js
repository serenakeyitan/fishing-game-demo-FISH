import React, { useState, useEffect } from 'react';

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

function ProbabilityWindow({ selectedBait, isOpen }) {
  const [isWindowOpen, setIsWindowOpen] = useState(isOpen);

  useEffect(() => {
    setIsWindowOpen(isOpen);
  }, [isOpen]);

  const calculateProbabilities = () => {
    const probabilities = {};
    for (let type in fishProbabilities) {
      const baseChance = fishProbabilities[type];
      const baitBonus = selectedBait ? baitInfluence[selectedBait][type] || 0 : 0;
      probabilities[type] = baseChance + baitBonus;
    }
    return probabilities;
  };

  const probabilities = calculateProbabilities();

  return (
    <div className={`probability-window ${isWindowOpen ? 'open' : ''}`}>
      <button className="collapse-button" onClick={() => setIsWindowOpen(!isWindowOpen)}>
        {isWindowOpen ? 'Close' : 'Open'}
      </button>
      {isWindowOpen && (
        <>
          <h3>Probabilities</h3>
          {selectedBait ? (
            <div>
              {Object.keys(probabilities).map((type) => (
                <p key={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}: {probabilities[type].toFixed(2)}%
                </p>
              ))}
            </div>
          ) : (
            <p>Select a bait to see probabilities.</p>
          )}
        </>
      )}
    </div>
  );
}

export default ProbabilityWindow;
