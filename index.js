const express = require('express');
const path = require('node:path');
const { loadEnvFile } = require('node:process'); loadEnvFile('.env');
const undici = require('undici');

const app = express();
app.use('/asset', express.static(path.join(__dirname, 'asset')));

app.get('/', (request, response) => {
	return response.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('/test', (request, response) => {
	return response.sendFile(path.join(__dirname, 'pages', 'test.html'));
});

app.get('/auth', async (request, response) => {
	const clientId = process.env.CLIENT_ID;
	const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);

	response.redirect(`https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify+guilds`);
});

app.get('/auth/callback', async (request, response) => {
	const code = request.query.code;
	if (!code) return response.status(400).send('Invalid code');

	try {
		const res_data = await undici.request('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				grant_type: 'authorization_code',
				code,
				redirect_uri: process.env.REDIRECT_URI,
			}).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		const auth_data = await res_data.body.json();

		if (!auth_data.access_token) {
			console.error(auth_data);
			return response.status(401).send('Fail to authenticate');
		}

		console.log(auth_data);

		return response.redirect('/dashboard');
	} catch (err) {
		console.error(err);
		return response.status(500).send('Authentication error');
	}
});


app.get('/dashboard', (request, response) => {
	return response.sendFile(path.join(__dirname, 'pages', 'dashboard.html'));
});

app.listen(process.env.WEB_PORT, () => console.log(`App listening at http://localhost:${process.env.WEB_PORT}`));

// from https://discordjs.guide/legacy/oauth2/oauth2