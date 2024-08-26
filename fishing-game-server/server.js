const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = {};  // To store player data by playerId
let fishPool = 0;
let countdown = 30;  // Global countdown time in seconds

// Start a global countdown that decrements every second
setInterval(() => {
    if (countdown > 0) {
        countdown--;
    } else {
        console.log("Countdown reached 0. Initiating token distribution...");
        distributeFishTokens();
        countdown = 30;  // Reset the countdown after distribution
    }

    // Broadcast the remaining countdown to all clients
    broadcastCountdown();
}, 1000);

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            switch (data.type) {
                case 'join':
                    handleJoin(ws, data.playerId);
                    break;
                case 'fish':
                    handleFishing(ws, data);
                    break;
                default:
                    console.log("Unknown message type:", data.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Send the current countdown to the client when they connect
    ws.send(JSON.stringify({ type: 'countdown', time: countdown }));

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function handleJoin(ws, playerId) {
    if (!players[playerId]) {
        players[playerId] = {
            id: playerId,
            inventory: {},
            ipBalance: 10,
            fishBalance: 10,
        };
        console.log(`New player registered: ${playerId}`);
    } else {
        console.log(`Player ${playerId} reconnected.`);
    }
    ws.send(JSON.stringify({ type: 'update', playerData: players[playerId] }));
}


function handleFishing(ws, data) {
    const player = players[data.playerId];
    if (!player) {
        ws.send(JSON.stringify({ type: 'error', message: "Player not found!" }));
        return;
    }

    // Ensure balances and inventory are updated correctly
    if (player.ipBalance >= 1 && player.fishBalance >= 1) {
        // Deduct IP and FISH tokens
        player.ipBalance = data.ipBalance;
        player.fishBalance = data.fishBalance;
        fishPool = data.fishPool;

        // Update the player's inventory
        player.inventory = data.inventory;

        // Send the updated player data back to the client
        ws.send(JSON.stringify({ type: 'update', playerData: player }));

        // Broadcast the updated player data to all clients
        broadcastUpdate();

        console.log(`Player ${data.playerId} fished and caught ${data.newCatch}.`);
        console.log(`Updated IP Balance: ${player.ipBalance}, FISH Balance: ${player.fishBalance}, Fish Pool: ${fishPool}`);
    } else {
        ws.send(JSON.stringify({ type: 'error', message: "Not enough tokens to fish!" }));
    }
}



function broadcastCountdown() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'countdown', time: countdown }));
        }
    });
}

function broadcastUpdate() {
    const updatedFishers = Object.values(players);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'update',
                playerData: updatedFishers
            }));
        }
    });
}

function distributeFishTokens() {
    if (Object.keys(players).length === 0 || fishPool === 0) {
        console.log("No players or fish pool is empty. Skipping distribution.");
        return;
    }

    console.log("Attempting to distribute tokens...");

    const sortedPlayers = Object.values(players).sort((a, b) => {
        const rarestA = calculateRarestFish(a.inventory);
        const rarestB = calculateRarestFish(b.inventory);
        return rarestB - rarestA;
    });

    const top15PercentIndex = Math.ceil(sortedPlayers.length * 0.15);
    const winners = sortedPlayers.slice(0, top15PercentIndex);

    if (winners.length === 0) {
        console.log("No winners selected. Skipping distribution.");
        return;
    }

    const reward = Math.floor(fishPool / winners.length);
    winners.forEach((winner) => {
        winner.fishBalance += reward;
        console.log(`Player ${winner.id} received ${reward} tokens. New balance: ${winner.fishBalance}`);
    });

    fishPool = 0;  // Reset the fish pool after distribution
    broadcastDistribution(winners, reward);
}

function broadcastDistribution(winners, reward) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'distribution',
                updatedFishers: winners,
                fishPool: 0,
                reward
            }));
        }
    });
}

function calculateRarestFish(inventory) {
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
}

console.log("Server started on ws://localhost:8080");
