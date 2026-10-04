const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ORDER_STATUSES } = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, validateId } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 49;
const TAX_RATE = 0.18;
const round2 = (n) => Math.round(n * 100) / 100;

const newTrackingId = () => 'SS' + crypto.randomBytes(5).toString('hex').toUpperCase();

const REQUIRED_ADDRESS = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode'];

// POST /api/orders  -> checkout: builds the order from the server-side cart
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { shippingAddress = {}, paymentMethod = 'COD' } = req.body;
    const missing = REQUIRED_ADDRESS.filter((f) => !String(shippingAddress[f] || '').trim());
    if (missing.length) {
      res.status(400);
      throw new Error(`Missing shipping details: ${missing.join(', ')}`);
    }
    if (!['COD', 'CARD', 'UPI'].includes(paymentMethod)) {
      res.status(400);
      throw new Error('Invalid payment method');
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    const lines = cart ? cart.items.filter((i) => i.product) : [];
    if (!lines.length) {
      res.status(400);
      throw new Error('Your cart is empty');
    }

    // Reserve stock atomically per product; roll back if any line fails.
    const reserved = [];
    try {
      for (const line of lines) {
        const updated = await Product.findOneAndUpdate(
          { _id: line.product._id, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } }
        );
        if (!updated) {
          res.status(400);
          throw new Error(`"${line.product.name}" does not have enough stock`);
        }
        reserved.push(line);
      }
    } catch (err) {
      await Promise.all(
        reserved.map((l) => Product.updateOne({ _id: l.product._id }, { $inc: { stock: l.quantity } }))
      );
      throw err;
    }

    const items = lines.map((l) => ({
      product: l.product._id,
      name: l.product.name,
      image: l.product.images[0] || '',
      price: l.product.price, // price always comes from the database, never the client
      quantity: l.quantity,
    }));
    const itemsPrice = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
    const shippingPrice = itemsPrice >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
    const taxPrice = round2(itemsPrice * TAX_RATE);
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      trackingId: newTrackingId(),
      isPaid: paymentMethod !== 'COD', // payment gateway is simulated
      paidAt: paymentMethod !== 'COD' ? new Date() : undefined,
      statusHistory: [{ status: 'Placed', note: 'Order placed successfully' }],
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.status(201).json({ order });
  })
);

router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  })
);

// Public-style tracking by tracking id (still requires login; owners and admins only)
router.get(
  '/track/:trackingId',
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ trackingId: req.params.trackingId.toUpperCase() });
    if (!order || (String(order.user) !== String(req.user._id) && req.user.role !== 'admin')) {
      res.status(404);
      throw new Error('No order found with that tracking ID');
    }
    res.json({ order });
  })
);

// Admin: list all orders. Declared before /:id so "admin" is not treated as an id.
router.get(
  '/admin/all',
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status, q } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (q) filter.trackingId = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  })
);

router.get(
  '/:id',
  validateId(),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    const ownerId = String(order.user._id || order.user);
    if (ownerId !== String(req.user._id) && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('You cannot view this order');
    }
    res.json({ order });
  })
);

const restock = (order) =>
  Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));

router.put(
  '/:id/cancel',
  validateId(),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order || String(order.user) !== String(req.user._id)) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (!['Placed', 'Confirmed'].includes(order.status)) {
      res.status(400);
      throw new Error('This order can no longer be cancelled');
    }
    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer' });
    await order.save();
    await restock(order);
    res.json({ order });
  })
);

// Admin: move an order through the lifecycle
router.put(
  '/:id/status',
  adminOnly,
  validateId(),
  asyncHandler(async (req, res) => {
    const { status, note = '' } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of: ${ORDER_STATUSES.join(', ')}`);
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      res.status(400);
      throw new Error(`A ${order.status.toLowerCase()} order can't be changed`);
    }
    if (status !== order.status) {
      order.status = status;
      order.statusHistory.push({ status, note });
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
        if (!order.isPaid) {
          order.isPaid = true; // cash collected on delivery
          order.paidAt = new Date();
        }
      }
      if (status === 'Cancelled') await restock(order);
      await order.save();
    }
    res.json({ order });
  })
);

module.exports = router;
