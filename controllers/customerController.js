const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const Customer = require('./../models/customerModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/bankfiles');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and CSV files are allowed!'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadFile = upload.single('file');

exports.uploadCustomerInfo = catchAsync(async (req, res, next) => {
  const { name, amount, duration } = req.body;

  // Calculate the installment amount and generate the repayment schedule
  const installmentAmount = amount / duration;
  const repaymentSchedule = [];

  for (let i = 1; i <= duration; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);

    const installment = {
      installmentNumber: i,
      dueDate,
      installmentAmount,
      remainingBalance: amount - i * installmentAmount,
      isPaid: false, // Initially, set isPaid to false for each installment
    };

    repaymentSchedule.push(installment);
  }

  // Create a new Customer document with the repayment schedule
  const customer = new Customer({
    customerName: name,
    loanAmount: amount,
    remainingAmount: amount,
    loanDuration: duration,
    bankFile: req.file.filename,
    repaymentSchedule: repaymentSchedule, // Include the generated repayment schedule
  });

  await customer.save();

  res.status(200).json({
    status: 'success',
    data: {
      customer,
    },
  });
});

exports.updateInstallmentPaymentStatus = catchAsync(async (req, res, next) => {
  const { customerId, installmentNumber } = req.params;
  const { paidAmount } = req.body;

  // Find the customer document by ID
  const customer = await Customer.findById(customerId);

  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  // Find the repayment installment within the customer's repayment schedule by installment number
  const installment = customer.repaymentSchedule.find(
    (inst) => inst.installmentNumber === parseInt(installmentNumber)
  );

  if (!installment) {
    return next(new AppError('Installment not found', 404));
  }

  // Check if the installment is already paid
  if (installment.isPaid) {
    return next(new AppError('Installment is already paid', 400));
  }

  // Deduct the paid amount from the customer's remainingAmount
  customer.remainingAmount -= paidAmount;

  // Mark the installment as paid
  installment.isPaid = true;

  // Save the updated customer document
  await customer.save();

  res.status(200).json({
    status: 'success',
    message: 'Installment payment updated successfully',
    data: {
      customer,
    },
  });
});

exports.getCustomer = factory.getOne(Customer);
exports.getAllCustomers = factory.getAll(Customer);
// exports.updateCustomer = factory.updateOne(Customer);
// exports.deleteCustomer = factory.deleteOne(Customer);
