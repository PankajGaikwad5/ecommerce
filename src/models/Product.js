import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    dimensions: {
      length: { type: Number, required: true }, // in cm
      width: { type: Number, required: true }, // in cm
      height: { type: Number, required: true }, // in cm
      weight: { type: Number, required: true }, // in kg
    },
    images: [{ type: String }], // URLs to images (max 10 on frontend)
    isBulky: { type: Boolean, default: false }, // NEW
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
