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

// /**
//  * @swagger
//  * /api/wallet/create-order:
//  *   post:
//  *     tags: [Wallet]
//  *     summary: Create PayPal order for wallet funding
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - amount
//  *             properties:
//  *               amount:
//  *                 type: number
//  */


/**
 * @swagger
 * /api/wallet/create-order:
 *   post:
 *     tags: [PayPal Payments]
 *     summary: Create PayPal order for wallet funding
 *     description: Creates a new PayPal order and stores the transaction details in the database
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
 *                 format: float
 *                 description: Amount to be charged in USD
 *                 example: 100.00
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: PayPal order ID
 *                   example: "5O190127TN364715T"
 *                 status:
 *                   type: string
 *                   description: Current status of the order
 *                   example: "CREATED"
 *                 links:
 *                   type: array
 *                   description: HATEOAS links for order actions
 *                   items:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                         example: "https://api.paypal.com/v2/checkout/orders/5O190127TN364715T"
 *                       rel:
 *                         type: string
 *                         example: "self"
 *                       method:
 *                         type: string
 *                         example: "GET"
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid amount. Please provide a valid positive number."
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized access"
 *       503:
 *         description: Payment service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Payment service temporarily unavailable. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create PayPal order. Please try again later."
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