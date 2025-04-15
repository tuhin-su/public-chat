const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const SERVER_UID = `UID-${Date.now()}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = [];

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve index.html at the root URL
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
function sanitizeInput(input) {
    // Replace dangerous characters with HTML entities
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('🔌 Client connected');
    const connectionId = `UID-${Date.now()}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
    ws.connectionId = connectionId;  // Store connection ID in ws object
    
    ws.send(JSON.stringify({
        type: 0,
        text: 'Welcome to the chat!',
        connectionId: SERVER_UID,
        user: {
            connectionId: SERVER_UID,
            name: "Bot lili",
            img: "https://i.pravatar.cc/120?u=000"
        }
    }));

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        const data = JSON.parse(message);
       
        // handel new user connection
        if (data.type === 2) {
            data.user.connectionId = connectionId;

            // send list of users new User
            ws.send(JSON.stringify({
                type: 4,
                users: users
            }));

            // store current user
            users.push(data.user);

            // alert others about new user
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify(data));
                }
            });
        }
        else if (data.type === 1) {
            data.connectionId = connectionId;
            wss.clients.forEach((client) => {
                if ( client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }

        else{
            ws.send(JSON.stringify({
                type: 4,
                code: 404,
                message: 'Invalid request',
                request: data
                
            }))
        }
    });

    // Event when the client disconnects
    ws.on('close', () => {
        // console.log('❌ Client disconnected');
        let data = {};
        data.type = 3;
        data.connectionId = connectionId;
            users = users.filter((user) => user.connectionId !== data.connectionId);
            wss.clients.forEach((client) => {
                if ( client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
    });

    // Event for handling WebSocket errors
    ws.on('error', (error) => {
        console.error('🚨 WebSocket error:', error);
    });
});

// Handle WebSocket server error event
wss.on('error', (error) => {
    console.error('🚨 WebSocket Server error:', error);
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    // console.log(`🚀 Server running at http://localhost:${PORT}`);
});
