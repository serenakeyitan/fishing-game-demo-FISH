import React, { useState } from 'react';
import Timer from './Timer';

function FishingSection({
  inventory,
  setSelectedBait,
  handleFishing,
  ipBalance,
  fishBalance,
  selectedBait
}) {
  const [isFishing, setIsFishing] = useState(false);

  const startFishing = () => {
    if (isFishing) return;
    if (ipBalance < 1 || fishBalance < 1) {
      alert("You don't have enough tokens to fish!");
      return;
    }

    setIsFishing(true);

    const waitTime = Math.floor(Math.random() * 6) + 5;

    setTimeout(() => {
      handleFishing(selectedBait);  // Send bait to server
      setIsFishing(false);
      setSelectedBait(null);
    }, waitTime * 1000);
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
    </div>
  );
}

export default FishingSection;

