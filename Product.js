const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0, default: 0 }, // original price, used to show discounts
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
