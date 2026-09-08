const WebSocket = require('ws');
const logger = require('../config/loggerConfig');
const allowedOrigins = ['https://localhost:3000', 'https://www.edutrack.com'];
const { attachWebSocketServer } = require('./ws-broadcast');

function startWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    attachWebSocketServer(wss);

    wss.on('connection', (ws, req) => {
        const origin = req.headers.origin;
        if (!allowedOrigins.includes(origin)) {
            ws.close(1008, 'Forbidden');
            return;
        }
        logger.log(`info`, `WS connected: ${origin}`);
        ws.on('message', msg => logger.log('info', 'WS msg:', msg.toString()));
    });

    process.on('SIGINT', () => {
        wss.clients.forEach(client => client.close());
        wss.close(() => logger.log('info', 'WS server closed'));
    });
}

module.exports = { startWebSocketServer };
