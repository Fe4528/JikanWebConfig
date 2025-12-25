const express = require('express');
const path = require('node:path');
const { loadEnvFile } = require('node:process'); loadEnvFile('.env');

const app = express();
app.use('/asset',express.static(path.join(__dirname, 'asset')));

app.get('/', (request, response) => {
	return response.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('/test', (request, response) => {
	return response.sendFile(path.join(__dirname, 'pages', 'test.html'));
});

app.listen(process.env.WEB_PORT, () => console.log(`App listening at http://localhost:${process.env.WEB_PORT}`));

// from https://discordjs.guide/legacy/oauth2/oauth2