const express = require('express');
const walletController = require('../controllers/WalletController');
const auth = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get wallet balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current balance
 */
router.get('/balance', auth, walletController.getBalance);

/**
 * @swagger
 * /api/wallet/create-order:
 *   post:
 *     tags: [Wallet]
 *     summary: Create PayPal order for wallet funding
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 */
router.post('/create-order', auth, walletController.createPayPalOrder);

/**
 * @swagger
 * /api/wallet/fund:
 *   post:
 *     tags: [Wallet]
 *     summary: Fund wallet using PayPal order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 */
router.post('/fund', auth, walletController.fundWallet);

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     tags: [Wallet]
 *     summary: Withdraw funds from wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 */
router.post('/withdraw', auth, walletController.withdraw);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get transaction history
 *     security:
 *       - bearerAuth: []
 */
router.get('/transactions', auth, walletController.getTransactionHistory);

module.exports = router;