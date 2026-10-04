const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { protect, validateId } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const loadCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  // drop lines whose product was deleted from the catalog
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.product);
  if (cart.items.length !== before) await cart.save();
  return cart;
};

const shape = (cart) => {
  const items = cart.items.map((i) => ({
    product: i.product,
    quantity: i.quantity,
    lineTotal: i.product.price * i.quantity,
  }));
  return {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    itemsPrice: items.reduce((s, i) => s + i.lineTotal, 0),
  };
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(shape(await loadCart(req.user._id)));
  })
);

router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const quantity = Math.max(parseInt(req.body.quantity, 10) || 1, 1);
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const cart = await loadCart(req.user._id);
    const line = cart.items.find((i) => String(i.product._id) === String(productId));
    const newQty = (line ? line.quantity : 0) + quantity;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} unit(s) of "${product.name}" in stock`);
    }
    if (line) line.quantity = newQty;
    else cart.items.push({ product: product._id, quantity });
    await cart.save();
    res.status(201).json(shape(await loadCart(req.user._id)));
  })
);

router.put(
  '/items/:productId',
  validateId('productId'),
  asyncHandler(async (req, res) => {
    const quantity = parseInt(req.body.quantity, 10);
    if (!quantity || quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    if (quantity > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} unit(s) in stock`);
    }
    const cart = await loadCart(req.user._id);
    const line = cart.items.find((i) => String(i.product._id) === req.params.productId);
    if (!line) {
      res.status(404);
      throw new Error('Item is not in your cart');
    }
    line.quantity = quantity;
    await cart.save();
    res.json(shape(await loadCart(req.user._id)));
  })
);

router.delete(
  '/items/:productId',
  validateId('productId'),
  asyncHandler(async (req, res) => {
    const cart = await loadCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.product._id) !== req.params.productId);
    await cart.save();
    res.json(shape(await loadCart(req.user._id)));
  })
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ items: [], count: 0, itemsPrice: 0 });
  })
);

module.exports = router;
