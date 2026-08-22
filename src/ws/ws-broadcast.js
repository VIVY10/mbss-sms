let wssInstance = null;

function attachWebSocketServer(wss) {
    wssInstance = wss;
}

function broadcast(data) {
    if (!wssInstance) return;
    const message = JSON.stringify(data);
    wssInstance.clients.forEach(client => {
        if (client.readyState === client.OPEN) client.send(message);
    });
}

module.exports = { attachWebSocketServer, broadcast };
