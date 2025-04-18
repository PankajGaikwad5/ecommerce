// src/models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
    },
    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'paid',
        'shipped',
        'completed',
        'cancelled',
        'pending_manual',
      ],
      default: 'pending',
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'shipped',
        'completed',
        'cancelled',
        'pending_manual',
      ],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
