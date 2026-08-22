// const WebSocket = require('ws');

// // List of domains allowed to open WebSocket connections
// const allowedOrigins = ['https://localhost:3000', 'https://www.edutrack.com'];

// function startWebSocketServer(server) {
//   // Attach WebSocket server to the existing HTTP server instance
//   const wss = new WebSocket.Server({ server });

//   // Fired whenever a client attempts to open a WebSocket connection
//   wss.on('connection', (ws, req) => {
//     const origin = req.headers.origin;

//     // Security: Reject WebSocket connections from unauthorized origins
//     if (!allowedOrigins.includes(origin)) {
//       console.log(`Rejected WS connection from origin: ${origin}`);
//       ws.close(1008, 'Forbidden'); // 1008 = Policy Violation
//       return;
//     }

//     console.log(`Accepted WS connection from origin: ${origin}`);

//     // Handles incoming WebSocket messages from the connected client
//     ws.on('message', (msg) => {
//       console.log('Received WS message:', msg.toString());
//       // Here you can forward the message, broadcast it, store it, etc.
//     });

//     // Fired whenever the client disconnects
//     ws.on('close', (code, reason) => {
//       console.log(`Client disconnected: ${code} - ${reason}`);
//     });

//     // Error logging for debugging purposes
//     ws.on('error', (err) => console.error('WebSocket error:', err));
//   });

//   // Graceful shutdown: close all WS clients & server when Node receives SIGINT (Ctrl+C)
//   process.on('SIGINT', () => {
//     wss.clients.forEach(client => client.close());
//     wss.close(() => console.log('WebSocket server closed'));
//   });
// }

// module.exports = { startWebSocketServer };


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
