const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [users, products, orders, revenueAgg, byStatus, daily, recentOrders, lowStock] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(6),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6).select('name stock images'),
    ]);

    // fill in days with no sales so the chart has 7 continuous points
    const map = Object.fromEntries(daily.map((d) => [d._id, d]));
    const last7 = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ date: key, revenue: map[key]?.revenue || 0, orders: map[key]?.orders || 0 });
    }

    res.json({
      users,
      products,
      orders,
      revenue: revenueAgg[0]?.total || 0,
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      last7,
      recentOrders,
      lowStock,
    });
  })
);

module.exports = router;
