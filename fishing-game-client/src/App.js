import React, { useState, useEffect } from 'react';
import FishingSection from './components/FishingSection';
import InventorySection from './components/InventorySection';
import ProbabilityWindow from './components/ProbabilityWindow';
import './index.css';

function App() {
  const [inventory, setInventory] = useState({});
  const [selectedBait, setSelectedBait] = useState(null);
  const [ipBalance, setIpBalance] = useState(10);
  const [fishBalance, setFishBalance] = useState(10);
  const [fishPool, setFishPool] = useState(0);
  const [distributionTimer, setDistributionTimer] = useState(30);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0); // State for tracking the current score
  const [wonTokens, setWonTokens] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [probabilityStatus, setProbabilityStatus] = useState(true); // Add this line


  useEffect(() => {
    const countdown = setInterval(() => {
      setDistributionTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setRound((prevRound) => prevRound + 1);
          setScore(0); // Reset score at the start of each round
          return 30;
        }
        return prevTimer - 1;
      });
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
    setIpBalance((prevBalance) => prevBalance - 1);
  };

  const handleFishing = (newCatch) => {
    console.log("handleFishing called with newCatch:", newCatch);

    // Update the balances before setting the state
    const updatedIpBalance = ipBalance - 1;
    const updatedFishPool = fishPool + 1;

    // Update the inventory with the new catch
    const updatedInventory = { ...inventory, [newCatch]: (inventory[newCatch] || 0) + 1 };

    // Calculate the score based on the new inventory
    const newScore = calculateRarestFish(updatedInventory);

    // Update the score by setting it to the newScore (accumulating from 0)
    setScore(newScore);

    // Define the target score range
    const targetMinScore = 10;
    const targetMaxScore = 13;

    // Log the current score and target range
    console.log(`Current Score: ${newScore}`);
    console.log(`Target Score Range: ${targetMinScore} - ${targetMaxScore}`);

    // Check the score and add 18-28 FISH tokens if the score is between 10 and 13
    if (newScore >= targetMinScore && newScore <= targetMaxScore) {
      const additionalFish = Math.floor(Math.random() * 11) + 18; // Random number between 18 and 28
      setFishBalance((prevBalance) => prevBalance + additionalFish);
      setWonTokens(additionalFish);  // Set the number of won tokens
      setAnimate(true);  // Trigger the animation
      console.log(`Score is ${newScore}. Added ${additionalFish} FISH tokens to the balance.`);
    }

    // Set the updated state locally
    setIpBalance(updatedIpBalance);
    setFishPool(updatedFishPool);
    setInventory(updatedInventory);

    console.log("handleFishing - Updated state:", {
        ipBalance: updatedIpBalance,
        fishBalance: fishBalance,
        fishPool: updatedFishPool,
        inventory: updatedInventory,
    });
  };

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        setAnimate(false); // Reset animation after it's done
      }, 1000); // Match the duration of the animation
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  return (
    <div className="container">
      <h1 className="round-counter">ROUND {round}</h1>
      <h1>Fishing Expedition with Bait</h1>
      <div className="notice">
        <strong>Top 15% of players who fish with the highest rarity score</strong> will get all the $FISH tokens of that round split! 
        <em>RarityScore will reset every round!</em>
      </div>
      <div className="faucets">
        <button onClick={claimIpToken}>Claim 1 $IP Token</button>
        <button onClick={claimFishToken}>Swap 1 $FISH Token</button>
      </div>
      <p>Your $IP Balance: {ipBalance}</p>
      <p>Your $FISH Balance: {fishBalance}</p>
      <p>Your Current Score: {score}</p>
      <p>Next Distribution in: {distributionTimer} seconds</p>
      {animate && (
        <div className="token-animation">+{wonTokens} FISH</div>
      )}
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
      <ProbabilityWindow selectedBait={selectedBait} isOpen={probabilityStatus} />
    </div>
  );
}

function generatePlayerId() {
  return `player_${Math.random().toString(36).substr(2, 9)}`;
}

export default App;