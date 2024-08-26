import React, { useState, useEffect } from 'react';
import FishingSection from './components/FishingSection';
import InventorySection from './components/InventorySection';
import ProbabilityWindow from './components/ProbabilityWindow';
import './index.css';
import { updateInventory, updateFishers } from './utils'; // Import the utility functions

function App() {
  const [inventory, setInventory] = useState({});
  const [selectedBait, setSelectedBait] = useState(null);
  const [ipBalance, setIpBalance] = useState(10);
  const [fishBalance, setFishBalance] = useState(10);
  const [fishPool, setFishPool] = useState(0);
  const [fishers, setFishers] = useState([]);
  const [distributionTimer, setDistributionTimer] = useState(30);
  const [ws, setWs] = useState(null);
  const [playerId] = useState(generatePlayerId());

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');

    websocket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(websocket);
      websocket.send(JSON.stringify({ type: 'join', playerId }));
    };

    websocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      switch (data.type) {
        case 'update':
          setPlayerData(data.playerData);
          break;
        case 'countdown':
          setDistributionTimer(data.time);
          break;
        case 'distribution':
          setFishers(data.updatedFishers);
          setFishPool(data.fishPool);
          console.log(`Distributed ${data.reward} FISH tokens to winners.`);
          break;
        case 'error':
          alert(data.message);
          break;
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING) {
        websocket.close();
      }
    };
  }, [playerId]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setDistributionTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 30));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const calculateRarestFish = (inventory) => {
    const rarityScore = {
      mythical: 7,
      legendary: 6,
      epic: 5,
      superRare: 4,
      rare: 3,
      uncommon: 2,
      common: 1,
    };

    return Object.keys(inventory).reduce((total, fish) => {
      return total + rarityScore[fish] * inventory[fish];
    }, 0);
  };

  const claimIpToken = () => {
    setIpBalance((prevBalance) => prevBalance + 1);
  };

  const claimFishToken = () => {
    setFishBalance((prevBalance) => prevBalance + 1);
  };

  const handleFishing = (newCatch) => {
    console.log("handleFishing called with newCatch:", newCatch);

    // Update the balances before setting the state
    const updatedIpBalance = ipBalance - 1;
    const updatedFishBalance = fishBalance - 1;
    const updatedFishPool = fishPool + 1;

    // Update the inventory with the new catch
    const updatedInventory = { ...inventory, [newCatch]: (inventory[newCatch] || 0) + 1 };

    // Set the updated state locally
    setIpBalance(updatedIpBalance);
    setFishBalance(updatedFishBalance);
    setFishPool(updatedFishPool);
    setInventory(updatedInventory);

    console.log("handleFishing - Updated state:", {
        ipBalance: updatedIpBalance,
        fishBalance: updatedFishBalance,
        fishPool: updatedFishPool,
        inventory: updatedInventory,
    });

    // Send the updated state to the server
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'fish',
            playerId,
            newCatch,
            inventory: updatedInventory,
            ipBalance: updatedIpBalance,
            fishBalance: updatedFishBalance,
            fishPool: updatedFishPool,
        }));
        console.log("Fishing message sent via WebSocket.");
    } else {
        console.error('WebSocket is not connected or not open.');
    }
};


  const setPlayerData = (data) => {
    setInventory((prevInventory) => ({ ...prevInventory, ...data.inventory }));
    setIpBalance(data.ipBalance ?? ipBalance);
    setFishBalance(data.fishBalance ?? fishBalance);
    setFishPool(data.fishPool ?? fishPool);
    setFishers(data.fishers ?? fishers);
  };

  return (
    <div className="container">
      <h1>Fishing Expedition with Bait</h1>
      <div className="faucets">
        <button onClick={claimIpToken}>Claim 1 $IP Token</button>
        <button onClick={claimFishToken}>Claim 1 $FISH Token</button>
      </div>
      <p>Your $IP Balance: {ipBalance}</p>
      <p>Your $FISH Balance: {fishBalance}</p>
      <p>Next Distribution in: {distributionTimer} seconds</p>
      <FishingSection
        inventory={inventory}
        setInventory={setInventory}
        selectedBait={selectedBait}
        setSelectedBait={setSelectedBait}
        handleFishing={handleFishing}
        ipBalance={ipBalance}
        setIpBalance={setIpBalance}
        fishBalance={fishBalance}
        setFishBalance={setFishBalance}
        setFishPool={setFishPool}
        fishPool={fishPool}
      />
      <InventorySection inventory={inventory} setSelectedBait={setSelectedBait} />
      <ProbabilityWindow selectedBait={selectedBait} />
    </div>
  );
}

function generatePlayerId() {
  return `player_${Math.random().toString(36).substr(2, 9)}`;
}

export default App;
