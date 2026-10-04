const express = require('express');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, validateId } = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, numReviews: -1 },
  name: { name: 1 },
};

// GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=&featured=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, minPrice, maxPrice, sort = 'newest', featured, inStock } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 60);

    const filter = {};
    if (q && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { description: rx }];
    }
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ products, page, pages: Math.ceil(total / limit) || 1, total });
  })
);

router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json({ categories: categories.sort() });
  })
);

router.get(
  '/:id',
  validateId(),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.json({ product, related });
  })
);

const pick = (body) => {
  const fields = ['name', 'description', 'brand', 'category', 'price', 'mrp', 'stock', 'images', 'featured', 'rating', 'numReviews'];
  const out = {};
  fields.forEach((f) => {
    if (body[f] !== undefined) out[f] = body[f];
  });
  if (typeof out.images === 'string') out.images = out.images.split(',').map((s) => s.trim()).filter(Boolean);
  return out;
};

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const product = await Product.create(pick(req.body));
    res.status(201).json({ product });
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  validateId(),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ product });
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  validateId(),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ message: 'Product deleted' });
  })
);

module.exports = router;
