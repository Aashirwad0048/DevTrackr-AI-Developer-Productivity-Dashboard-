const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signJWT } = require('../utils/generateJWT');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signJWT({ id: user._id });
    res.json({ user, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = signJWT({ id: user._id });
    res.json({ user, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
