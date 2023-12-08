const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:3000');

let username = '';
let userColor = { r: 255, g: 0, b: 0 };

socket.on('open', () => {
    console.log('Подключение к серверу...');
    rl.question('Введите ваш никнейм: ', (enteredUsername) => {
        rl.question('Введите предпочитаемый цвет (#FF0000): ', (color) => {
            username = enteredUsername;
            userColor = parseColor(color.trim()) || userColor;
            const data = { type: 'join', user: username, color: userColor };
            socket.send(JSON.stringify(data));
            rl.prompt(true);
        });
    });
});

socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'system') {
        console.log('\x1b[31m%s\x1b[0m', data.message);
    } else if (data.type === 'chat') {
        const userMessageColor = data.color || { r: 255, g: 255, b: 255 };
        console.log(`\x1b[38;2;${userMessageColor.r};${userMessageColor.g};${userMessageColor.b}m%s\x1b[0m`, `${data.user}: ${data.message}`);
    }

    rl.prompt(true);
});

socket.on('close', () => {
    console.log('Подключение закрыто...');
    process.exit();
});

rl.on('line', (input) => {
    if (input.startsWith('/rename')) {
        const newUsername = input.split(' ')[1];
        if (newUsername) {
            username = newUsername;
            console.log(`Ваш никнейм был изменен на ${username}`);
        } else {
            console.log('Неизвестная команда. Пожалуйста, попробуйте снова! "/rename New_Username" чтобы изменить ваш никнейм.');
        }
    } else if (input.startsWith('/color')) {
        const newColor = parseColor(input.split(' ')[1]);
        if (newColor) {
            userColor = newColor;
            console.log(`Цвет вашего ника был изменен.`);
        } else {
            console.log('Неизвестная команда. Пожалуйста, попробуйте снова! "/color #FF0000" чтобы изменить цвет вашего ника.');
        }
    } else {
        const data = { type: 'chat', user: username, message: input, color: userColor };
        socket.send(JSON.stringify(data));
    }
    rl.prompt(true);
});

rl.on('close', () => {
    console.log('Подключение закрыто...');
    process.exit();
});

function parseColor(color) {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        const hex = color.substring(1);
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    } else {
        return null;
    }
}