require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send({status: 'DevTrackr backend running'}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/auth', require('./routes/oauthRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

if (require.main === module) {
	connectDB();
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

module.exports = app;
