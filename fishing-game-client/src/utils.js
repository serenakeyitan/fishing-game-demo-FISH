// utils.js

export const updateInventory = (setInventory, item) => {
    setInventory((prevInventory) => {
      const updatedInventory = { ...prevInventory };
      if (updatedInventory[item]) {
        updatedInventory[item]++;
      } else {
        updatedInventory[item] = 1;
      }
      return updatedInventory;
    });
  };
  
  export const updateFishers = (setFishers, playerId, newCatch, updatedInventory, updatedFishBalance) => {
    setFishers((prevFishers) => {
      const existingFisherIndex = prevFishers.findIndex((fisher) => fisher.id === playerId);
  
      if (existingFisherIndex !== -1) {
        const updatedFishers = [...prevFishers];
        const existingFisher = { ...updatedFishers[existingFisherIndex] };
  
        existingFisher.inventory = updatedInventory;
        existingFisher.fishBalance = updatedFishBalance;
  
        updatedFishers[existingFisherIndex] = existingFisher;
        return updatedFishers;
      } else {
        return [
          ...prevFishers,
          {
            id: playerId,
            inventory: updatedInventory,
            fishBalance: updatedFishBalance,
          },
        ];
      }
    });
  };
  