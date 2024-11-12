
const Transaction = require('../models/transaction');
const paypalClient = require('../config/paypal');
const paypal = require('@paypal/checkout-server-sdk');
const logger = require('../utils/logger');
const Wallet = require('../models/Wallet');

const walletController = {
  async getBalance(req, res) {
    try {
      const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
      res.json({ balance: wallet.balance });
    } catch (error) {
      logger.error('Balance check error:', error);
      res.status(500).json({ error: 'Failed to retrieve balance' });
    }
  },

  async createPayPalOrder(req, res) {
    try {
      const { amount } = req.body;
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: amount
          }
        }]
      });

      const order = await paypalClient.execute(request);
      res.json({ orderId: order.result.id });
    } catch (error) {
      logger.error('PayPal order creation error:', error);
      res.status(500).json({ error: 'Failed to create PayPal order' });
    }
  },

  async fundWallet(req, res) {
    try {
      const { orderId } = req.body;
      const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      const capture = await paypalClient.execute(request);

      const amount = parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value);

      await Transaction.create({
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        status: 'COMPLETED',
        paypalTransactionId: capture.result.id,
        description: 'PayPal deposit'
      });

      wallet.balance = parseFloat(wallet.balance) + amount;
      await wallet.save();

      res.json({ 
        message: 'Wallet funded successfully',
        newBalance: wallet.balance
      });
    } catch (error) {
      logger.error('Wallet funding error:', error);
      res.status(500).json({ error: 'Failed to fund wallet' });
    }
  },

  async withdraw(req, res) {
    try {
      const { amount } = req.body;
      const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      await Transaction.create({
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount,
        status: 'COMPLETED',
        description: 'Withdrawal to bank account'
      });

      wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
      await wallet.save();

      res.json({ 
        message: 'Withdrawal successful',
        newBalance: wallet.balance
      });
    } catch (error) {
      logger.error('Withdrawal error:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  },

  async getTransactionHistory(req, res) {
    try {
      const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
      const transactions = await Transaction.findAll({
        where: { walletId: wallet.id },
        order: [['createdAt', 'DESC']]
      });

      res.json({ transactions });
    } catch (error) {
      logger.error('Transaction history error:', error);
      res.status(500).json({ error: 'Failed to retrieve transaction history' });
    }
  }
};

module.exports = walletController;