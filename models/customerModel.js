const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    minlength: 2, // Minimum length for customer name
    maxlength: 50, // Maximum length for customer name
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 10, // Minimum loan amount
    max: 1000000, // Maximum loan amount (adjust as needed)
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  loanDuration: {
    type: Number,
    required: true,
    min: 1, // Minimum loan duration (e.g., 1 month)
    max: 120, // Maximum loan duration (e.g., 10 years)
  },
  bankFile: {
    type: String,
    required: true,
    maxlength: 255, // Maximum length for file path or reference
  },
  repaymentSchedule: [
    {
      installmentNumber: Number,
      dueDate: Date,
      installmentAmount: Number,
      remainingBalance: Number,
      isPaid: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model('Customer', customerSchema);
