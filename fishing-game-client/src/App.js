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

  const claimIpToken = () => {
    setIpBalance((prevBalance) => prevBalance + 1);
  };

  const claimFishToken = () => {
    setFishBalance((prevBalance) => prevBalance + 1);
  };

  const handleFishing = (selectedBait) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'fish',
        playerId,  // Ensure playerId is sent to the server
        selectedBait,
      }));
      console.log("Fishing message sent via WebSocket.");
    } else {
      console.error('WebSocket is not connected or not open.');
    }
  };


// const setPlayerData = (data) => {
//     setInventory((prevInventory) => ({ ...prevInventory, ...data.inventory }));
//     setIpBalance(data.ipBalance ?? ipBalance);
//     setFishBalance(data.fishBalance ?? fishBalance);
//     setFishPool(data.fishPool ?? fishPool);
//     setFishers(data.fishers ?? fishers);
// };


const setPlayerData = (data) => {
    setInventory(data.inventory || {});
    setIpBalance(data.ipBalance || 0);
    setFishBalance(data.fishBalance || 0);
    setFishPool(data.fishPool || 0);
    setFishers(data.fishers || []);
    setSelectedBait(null); // Reset the selected bait after fishing
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
