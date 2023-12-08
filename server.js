const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');

const express = require('express');
const app = express();

app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = [];

wss.on('connection', (socket) => {
    console.log('Пользователь подключился...');

    socket.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            const user = { id: socket._socket.remoteAddress, name: data.user, color: data.color };
            users.push(user);

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'system',
                        message: `${data.user} присоединился к чату.`,
                        color: 'red'
                    }));
                }
            });
        } else if (data.type === 'chat') {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'chat',
                        user: data.user,
                        message: data.message,
                        color: data.color
                    }));
                }
            });
        }
    });

    socket.on('close', () => {
        const user = users.find(u => u.id === socket._socket.remoteAddress);
        if (user) {
            users.splice(users.indexOf(user), 1);

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'system',
                        message: `${user.name} покинул чат.`,
                        color: 'red'
                    }));
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
