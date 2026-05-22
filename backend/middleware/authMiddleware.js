const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  let token;
  const authHeader = req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Standard API requests from client
    token = authHeader.replace('Bearer ', '');
  } else if (req.query.token) {
    // OAuth browser redirects
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) { res.status(401).json({ error: 'Invalid or expired token' }); }
};
