import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    dimensions: { type: String },
    images: [{ type: String }], // URLs to images (max 10 on frontend)
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
