
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
      const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
      
      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          error: 'Invalid amount. Please provide a valid positive number.'
        });
      }

      // Format amount to 2 decimal places
      const formattedAmount = Number(amount).toFixed(2);
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: formattedAmount
          },
          description: "Wallet funding"  // Add description for better tracking
        }],
        application_context: {
          brand_name: "Your Wallet App",
          landing_page: "NO_PREFERENCE",  // or "LOGIN" to require PayPal login
          user_action: "PAY_NOW",  // Skip review page
          return_url: `${process.env.APP_URL}/payment-success`,  // Add these URLs to your .env
          cancel_url: `${process.env.APP_URL}/payment-cancelled`
        }
      });

      const order = await paypalClient.execute(request);

      console.log(order)
      
      // Store order details in database for tracking (optional but recommended)
      await Transaction.create({
        walletId: wallet.id, // Assuming you have wallet info in req.user
        type: 'DEPOSIT',
        amount: formattedAmount,
        status: 'PENDING',
        paypalTransactionId: order.result.id,
        description: 'PayPal deposit - Order created'
      });

      return res.json({ 
        orderId: order.result.id,
        status: order.result.status,
        links: order.result.links
      });

    } catch (error) {
      logger.error('PayPal order creation error:', error);
      
      // More specific error handling
      if (error.statusCode === 422) {
        return res.status(400).json({ 
          error: 'Invalid payment details. Please check your input.'
        });
      }
      
      if (error.name === 'NetworkError') {
        return res.status(503).json({ 
          error: 'Payment service temporarily unavailable. Please try again later.'
        });
      }

      return res.status(500).json({ 
        error: 'Failed to create PayPal order. Please try again later.'
      });
    }
  },

  async fundWallet(req, res) {
    try {
      const { orderId } = req.body;
      const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      const capture = await paypalClient.execute(request);

      console.log(capture)

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

      return res.json({ 
        message: 'Wallet funded successfully',
        newBalance: wallet.balance
      });
    } catch (error) {
      logger.error('Wallet funding error:', error);
      return res.status(500).json({ error: 'Failed to fund wallet' });
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

      return res.json({ 
        message: 'Withdrawal successful',
        newBalance: wallet.balance
      });
    } catch (error) {
      logger.error('Withdrawal error:', error);
      return res.status(500).json({ error: 'Failed to process withdrawal' });
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