
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

const userController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;
      
      const user = await User.create({ email, password, name });
      await Wallet.create({ userId: user.id });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      
      return res.status(201).json({ user, token });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(400).json({ error: 'Registration failed' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      
      if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      
      res.json({ user, token });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
};

module.exports = userController;