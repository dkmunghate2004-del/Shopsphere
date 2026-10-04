require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const img = (seed) => `https://picsum.photos/seed/${seed}/800/800`;

const products = [
  ['Aero Wireless Headphones', 'Electronics', 'Aero', 4999, 7999, 25, 4.6, 312, true, 'Over-ear Bluetooth 5.3 headphones with active noise cancellation and 40-hour battery life.'],
  ['Pulse Smartwatch Series 5', 'Electronics', 'Pulse', 8999, 12999, 18, 4.4, 208, true, 'AMOLED display, heart-rate and SpO2 tracking, GPS, and 7-day battery.'],
  ['Nova 20,000mAh Power Bank', 'Electronics', 'Nova', 1799, 2499, 60, 4.3, 540, false, 'Fast-charging 22.5W power bank with dual USB-A and USB-C ports.'],
  ['Orbit Mechanical Keyboard', 'Electronics', 'Orbit', 3499, 4999, 30, 4.7, 189, true, 'Hot-swappable 75% mechanical keyboard with RGB backlight and gasket mount.'],
  ['Everyday Cotton T-Shirt', 'Fashion', 'Urbane', 599, 999, 120, 4.2, 860, false, '100% combed cotton regular-fit tee, pre-shrunk and breathable.'],
  ['Slate Slim-Fit Chinos', 'Fashion', 'Urbane', 1499, 2299, 70, 4.1, 301, false, 'Stretch-cotton chinos with a tapered leg for all-day comfort.'],
  ['Trail Runner Sneakers', 'Fashion', 'Stride', 2799, 3999, 45, 4.5, 427, true, 'Lightweight mesh running shoes with cushioned midsole and grippy outsole.'],
  ['Canvas Weekender Backpack', 'Fashion', 'Voyager', 1999, 2999, 38, 4.4, 156, false, '28L water-resistant canvas backpack with padded laptop sleeve.'],
  ['Ceramic Pour-Over Coffee Set', 'Home & Kitchen', 'Brewly', 1299, 1799, 40, 4.6, 98, true, 'Handmade ceramic dripper with server and two cups.'],
  ['Cast Iron Skillet 10"', 'Home & Kitchen', 'Forge', 1699, 2199, 22, 4.8, 264, false, 'Pre-seasoned cast iron skillet that goes from stovetop to oven.'],
  ['Linen Throw Blanket', 'Home & Kitchen', 'Hearth', 1199, 1799, 55, 4.3, 77, false, 'Soft washed-linen throw in a calm neutral weave, 130 x 180 cm.'],
  ['Desk Lamp with Wireless Charger', 'Home & Kitchen', 'Lumen', 2299, 3299, 3, 4.5, 133, false, 'Dimmable LED lamp with a built-in Qi wireless charging pad.'],
  ['Atomic Habits (Paperback)', 'Books', 'Penguin', 399, 599, 200, 4.8, 2210, true, 'A practical guide to building good habits and breaking bad ones.'],
  ['The Pragmatic Programmer', 'Books', 'Addison-Wesley', 2499, 3299, 14, 4.7, 540, false, 'Classic software craftsmanship handbook, 20th anniversary edition.'],
  ['Yoga Mat Pro 6mm', 'Sports', 'Zenfit', 999, 1599, 80, 4.4, 392, false, 'Non-slip TPE yoga mat with alignment lines and carry strap.'],
  ['Adjustable Dumbbell Pair', 'Sports', 'IronPeak', 5499, 7499, 0, 4.6, 118, false, 'Quick-adjust dumbbells from 2 to 24 kg each. Currently out of stock.'],
].map(([name, category, brand, price, mrp, stock, rating, numReviews, featured, description], i) => ({
  name,
  category,
  brand,
  price,
  mrp,
  stock,
  rating,
  numReviews,
  featured,
  description,
  images: [img(`shopsphere-${i + 1}-a`), img(`shopsphere-${i + 1}-b`), img(`shopsphere-${i + 1}-c`)],
}));

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsphere');

  if (process.argv.includes('--reset')) {
    await Promise.all([User.deleteMany(), Product.deleteMany(), Cart.deleteMany(), Order.deleteMany()]);
    console.log('Existing data cleared');
  }

  const accounts = [
    { name: 'Store Admin', email: 'admin@shopsphere.com', password: 'Admin@123', role: 'admin' },
    { name: 'Demo User', email: 'user@shopsphere.com', password: 'User@123', role: 'user' },
  ];
  for (const a of accounts) {
    if (!(await User.findOne({ email: a.email }))) await User.create(a);
  }

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products`);
  } else {
    console.log('Products already exist, skipping (use npm run seed:reset to start fresh)');
  }

  console.log('\nDemo logins:');
  console.log('  Admin -> admin@shopsphere.com / Admin@123');
  console.log('  User  -> user@shopsphere.com  / User@123');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
