const jwt = require('jsonwebtoken');

exports.signJWT = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
