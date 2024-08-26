import React from 'react';

function InventorySection({ inventory, setSelectedBait }) {
  return (
    <div className="inventory-section">
      <h2>Your Catches</h2>
      <div className="inventory-grid">
        {Object.keys(inventory).length === 0 ? (
          <p>No fish caught yet.</p>
        ) : (
          Object.keys(inventory).map((fish) => (
            <div
              key={fish}
              className="inventory-item"
              onClick={() => setSelectedBait(fish)}
            >
              <p>{fish.charAt(0).toUpperCase() + fish.slice(1)}</p>
              <p>Quantity: {inventory[fish]}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InventorySection;
