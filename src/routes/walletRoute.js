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
 *     tags: [Wallet]
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

// /**
//  * @swagger
//  * /api/wallet/fund:
//  *   post:
//  *     tags: [Wallet]
//  *     summary: Fund wallet using PayPal order
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - orderId
//  *             properties:
//  *               orderId:
//  *                 type: string
//  */

/**
 * @swagger
 * /api/wallet/fund:
 *   post:
 *     tags: [Wallet]
 *     summary: Fund wallet using PayPal order
 *     description: Captures a previously created PayPal order and adds the amount to user's wallet balance
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
 *                 description: PayPal order ID from the create-order response
 *                 example: "5O190127TN364715T"
 *     responses:
 *       200:
 *         description: Wallet funded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Wallet funded successfully"
 *                 newBalance:
 *                   type: number
 *                   description: Updated wallet balance after funding
 *                   example: 250.00
 *       400:
 *         description: Invalid order ID or order already captured
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid order ID or order already captured"
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
 *       404:
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Wallet not found"
 *       422:
 *         description: Order capture failed - PayPal validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order capture failed. Please try again."
 *                 details:
 *                   type: object
 *                   properties:
 *                     issue:
 *                       type: string
 *                       example: "ORDER_NOT_APPROVED"
 *                     description:
 *                       type: string
 *                       example: "Payer has not yet approved the Order for payment"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fund wallet"
 */
router.post('/fund', auth, walletController.fundWallet);

/**
//  * /api/wallet/withdraw:
//  *   post:
//  *     tags: [Wallet]
//  *     summary: Withdraw funds from wallet
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

    **
    * @swagger
    * /api/wallet/withdraw:
    *   post:
    *     tags: [Wallet]
    *     summary: Withdraw funds from wallet to bank account
    *     description: Process a withdrawal from user's wallet to their linked bank account
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
    *                 description: Amount to withdraw
    *                 example: 100.00
    *     responses:
    *       200:
    *         description: Withdrawal processed successfully
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 message:
    *                   type: string
    *                   description: Success message
    *                   example: "Withdrawal successful"
    *                 newBalance:
    *                   type: number
    *                   description: Updated wallet balance after withdrawal
    *                   example: 150.00
    *       400:
    *         description: Insufficient funds or invalid amount
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 error:
    *                   type: string
    *                   example: "Insufficient funds"
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
    *       500:
    *         description: Internal server error
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 error:
    *                   type: string
    *                   example: "Failed to process withdrawal"
    *
 */
router.post('/withdraw', auth, walletController.withdraw);

/**
//  * /api/wallet/transactions:
//  *   get:
//  *     tags: [Wallet]
//  *     summary: Get transaction history
//  *     security:
//  *       - bearerAuth: []

@swagger
 * /api/wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get user's transaction history
 *     description: Retrieves all transactions associated with the user's wallet
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Transaction ID
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       walletId:
 *                         type: string
 *                         description: ID of the wallet
 *                         example: "wallet123"
 *                       type:
 *                         type: string
 *                         description: Type of transaction
 *                         enum: [DEPOSIT, WITHDRAWAL]
 *                         example: "DEPOSIT"
 *                       amount:
 *                         type: number
 *                         description: Transaction amount
 *                         example: 100.00
 *                       status:
 *                         type: string
 *                         description: Status of the transaction
 *                         enum: [PENDING, COMPLETED, FAILED]
 *                         example: "COMPLETED"
 *                       description:
 *                         type: string
 *                         description: Transaction description
 *                         example: "PayPal deposit"
 *                       paypalTransactionId:
 *                         type: string
 *                         description: PayPal transaction ID (for PayPal transactions)
 *                         example: "PAY-1MD123456"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Transaction creation timestamp
 *                         example: "2024-11-13T10:30:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Transaction last update timestamp
 *                         example: "2024-11-13T10:30:00Z"
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve transaction history"
 */
router.get('/transactions', auth, walletController.getTransactionHistory);

module.exports = router;