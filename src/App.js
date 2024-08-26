import React, { useState } from 'react';
import FishingSection from './components/FishingSection';
import InventorySection from './components/InventorySection';
import ProbabilityWindow from './components/ProbabilityWindow';
import './index.css';

function App() {
  const [inventory, setInventory] = useState({});
  const [selectedBait, setSelectedBait] = useState(null);

  const addCatchToInventory = (catchResult) => {
    setInventory((prevInventory) => {
      const updatedInventory = { ...prevInventory };
      if (updatedInventory[catchResult]) {
        updatedInventory[catchResult]++;
      } else {
        updatedInventory[catchResult] = 1;
      }
      return updatedInventory;
    });
  };

  const removeFishFromInventory = (fish) => {
    setInventory((prevInventory) => {
      const updatedInventory = { ...prevInventory };
      if (updatedInventory[fish] > 1) {
        updatedInventory[fish]--;
      } else {
        delete updatedInventory[fish];
      }
      return updatedInventory;
    });
  };

  return (
    <div className="container">
      <h1>Fishing Expedition with Bait</h1>
      <FishingSection
        addCatchToInventory={addCatchToInventory}
        removeFishFromInventory={removeFishFromInventory}
        inventory={inventory}
        selectedBait={selectedBait}
        setSelectedBait={setSelectedBait}
      />
      <InventorySection inventory={inventory} setSelectedBait={setSelectedBait} />
      <ProbabilityWindow selectedBait={selectedBait} />
    </div>
  );
}

export default App;
