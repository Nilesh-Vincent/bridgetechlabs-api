// routes/fileRoutes.js
const express = require('express');
const customerController = require('../controllers/customerController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/',
  customerController.getAllCustomers
);

router.get(
  '/:id',
  customerController.getCustomer
);


router.post(
  '/upload',
  customerController.uploadFile,
  customerController.uploadCustomerInfo
);

router.put(
  '/:customerId/repayments/:installmentNumber/pay',
  customerController.updateInstallmentPaymentStatus
);


module.exports = router;
