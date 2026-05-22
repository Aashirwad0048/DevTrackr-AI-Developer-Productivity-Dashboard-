require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Global error handlers to aid debugging during development
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception thrown:', err);
});

app.get('/', (req, res) => res.send({status: 'DevTrackr backend running'}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/auth', require('./routes/oauthRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/dev', require('./routes/devRoutes'));

if (require.main === module) {
		connectDB();
		const basePort = parseInt(process.env.PORT, 10) || 5000;
		const maxAttempts = 5;

		let serverInstance = null;
		const startServer = (port, attemptsLeft) => {
			try {
				const server = app.listen(port, () => console.log(`Server listening on port ${port}`));
				serverInstance = server;
				server.on('error', (err) => {
					if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
						console.warn(`Port ${port} in use, trying port ${port + 1}...`);
						setTimeout(() => startServer(port + 1, attemptsLeft - 1), 500);
					} else {
						console.error('Server error:', err);
						process.exit(1);
					}
				});
			} catch (err) {
				if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
					console.warn(`Port ${port} in use, trying port ${port + 1}...`);
					setTimeout(() => startServer(port + 1, attemptsLeft - 1), 500);
				} else {
					console.error('Failed to start server:', err);
					process.exit(1);
				}
			}
		};

		startServer(basePort, maxAttempts);

		const shutdown = async () => {
			console.log('Shutting down server...');
			if (serverInstance) {
				try { await new Promise((res, rej) => serverInstance.close(err => err ? rej(err) : res())); } catch(e) { console.error('Error closing server', e); }
			}
			try { await mongoose.disconnect(); } catch(e) { /* ignore */ }
			process.exit(0);
		};

		process.on('SIGINT', shutdown);
		process.on('SIGTERM', shutdown);
}

module.exports = app;
