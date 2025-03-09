const mongoose = require('mongoose');
const slugify = require('slugify');

// Voucher Model
const voucherSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A voucher must have a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'A voucher must have a description'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'A voucher must have a category'],
    enum: ['Food', 'Travel', 'Shopping', 'Entertainment'],
  },
  pointsRequired: {
    type: Number,
    required: [true, 'A voucher must require points'],
  },
  quantityAvailable: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: [true, 'A voucher must have an expiry date'],
  },
  slug: String,
});

voucherSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

// Cart Model
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  vouchers: [
    {
      voucher: {
        type: mongoose.Schema.ObjectId,
        ref: 'Voucher',
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model('Cart', cartSchema);

// Order History Model
const orderHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  vouchers: [
    {
      voucher: {
        type: mongoose.Schema.ObjectId,
        ref: 'Voucher',
      },
      quantity: {
        type: Number,
        required: true,
      },
      redeemedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  totalPointsUsed: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);

module.exports = { Voucher, Cart, OrderHistory };
