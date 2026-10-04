# ShopSphere

A full-stack e-commerce web app: product catalog with search and filters, cart, checkout, order tracking, JWT login with Admin/User roles, and an admin panel for products, orders and users.

**Stack:** React (Vite) + Framer Motion on the front end; Node.js + Express + MongoDB (Mongoose) on the back end.

## Run it locally

You need Node.js 18+ and a MongoDB instance (local install or a free MongoDB Atlas cluster).

```bash
# 1. API
cd server
npm install
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm run seed                # creates demo accounts and 16 products
npm run dev                 # http://localhost:5000

# 2. Web app (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Demo logins (created by the seed script):

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@shopsphere.com   | Admin@123  |
| User  | user@shopsphere.com    | User@123   |

`npm run seed:reset` wipes users, products, carts and orders first.

## Features

- Catalog with text search, category and price filters, sorting, pagination
- Product details with gallery, discount, stock status, related items
- Server-side cart, stock-checked checkout, order totals (shipping + 18% GST) computed on the server
- Order lifecycle: Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered (or Cancelled), with a timeline on the tracking page
- Customers can cancel while an order is Placed/Confirmed; stock is returned
- Register/login with hashed passwords and JWT; public sign-up can only create `user` accounts
- Admin: dashboard (revenue, 7-day chart, low stock), product CRUD, order status updates, user roles
- Dark/light mode, responsive layout, animated page transitions

## API overview

| Area     | Endpoints |
|----------|-----------|
| Auth     | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Products | `GET /api/products`, `GET /api/products/:id`, `GET /api/products/categories`; admin: `POST`, `PUT /:id`, `DELETE /:id` |
| Cart     | `GET /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/:productId`, `DELETE /api/cart` |
| Orders   | `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders/track/:trackingId`, `GET /api/orders/:id`, `PUT /api/orders/:id/cancel`; admin: `GET /api/orders/admin/all`, `PUT /api/orders/:id/status` |
| Users    | `GET/PUT /api/users/profile`, `PUT /api/users/password`; admin: `GET /api/users`, `PUT /:id/role`, `DELETE /:id` |
| Admin    | `GET /api/admin/stats` |

## Project layout

```
server/src  models/ routes/ middleware/ utils/ app.js server.js seed.js
client/src  components/ context/ pages/ (pages/admin/) api.js utils.js App.jsx
```

## Notes

- Payments are simulated; no card or UPI data is collected or processed.
- Product images in the seed data come from picsum.photos and need internet access.
- For production, set a strong `JWT_SECRET`, restrict `CLIENT_URL`, and serve the built client (`npm run build`) behind your API or a static host.
