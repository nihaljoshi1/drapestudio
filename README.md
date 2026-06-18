# 🛍️ Drape Studio | Full-Stack E-Commerce Platform

> A production-grade e-commerce platform built from scratch, documented publicly — every commit, every bug, every decision.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Express%20%7C%20Supabase-blue?style=flat-square)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square)
![Portfolio](https://img.shields.io/badge/Type-Portfolio%20Project-purple?style=flat-square)

---

## 📌 About

**Drape Studio** is a full-stack e-commerce web application built entirely from scratch as a portfolio project. The goal is to simulate a real-world production environment — clean architecture, structured APIs, relational database design, and a polished frontend.

This project is being built and documented publicly on LinkedIn — day by day, commit by commit.

🔗 Follow the build journey: [LinkedIn — @joshi_nihal10](https://www.linkedin.com/in/joshi_nihal10)

---

## ⚙️ Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Component-driven UI, fast HMR, perfect for dynamic product/cart state |
| Backend | Node.js + Express | Lightweight, full API control, no framework overhead |
| Database | Supabase (PostgreSQL) | Relational data model, built-in auth, row-level security |
| Auth | Supabase Auth | JWT-based, secure, integrates seamlessly with the DB |
| Storage | Supabase Storage | Product image uploads |
| Deployment | TBD | Vercel (Frontend) + Render (Backend) — planned |

---

## 🗂️ Project Structure

```
drapestudio/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── public/
│
├── backend/           # Node.js + Express REST API
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

## 🚀 Features (Planned & In Progress)

- [x] Project setup & folder architecture
- [ ] Supabase database schema — products, users, orders, cart
- [ ] User authentication — register, login, JWT sessions
- [ ] Product listing with filters & search
- [ ] Single product page
- [ ] Shopping cart (add, remove, update quantity)
- [ ] Checkout flow
- [ ] Payment integration (Razorpay)
- [ ] Order history & tracking
- [ ] Admin dashboard — manage products & orders
- [ ] Fully responsive UI

---

## 🛠️ Local Setup

> For review purposes only. See copyright notice below before using any part of this codebase.

### Prerequisites

- Node.js v18+
- npm or yarn
- Supabase account

### Steps

```bash
# Clone the repository
git clone https://github.com/nihaljoshi1/drapestudio.git

# Setup Backend
cd backend
npm install
cp .env.example .env
# Fill in your Supabase credentials in .env
npm run dev

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env
# Fill in your Supabase URL and anon key in .env
npm run dev
```

---

## 🗓️ Build Log

| Day | What Was Done |
|-----|---------------|
| Day 1 | Project initialized, folder structure set, dependencies installed, repo pushed |
| Day 2 | _(coming soon)_ |

> Full daily breakdown documented on [LinkedIn](https://www.linkedin.com/in/joshi_nihal10)

---

## 📸 Screenshots

> Will be added as the project progresses.

---

## 👤 Author

**Nihal Joshi**
Full-Stack Web Developer · Vedhaan Technology · Bhavnagar, Gujarat, India

- LinkedIn: [@joshi_nihal10](https://www.linkedin.com/in/joshi_nihal10)
- GitHub: [@nihaljoshi1](https://github.com/nihaljoshi1)

---

## ⚠️ Copyright & Legal Notice

© 2026 Nihal Joshi. All Rights Reserved.

This project and its entire source code, design, architecture, and documentation are the **exclusive intellectual property of Nihal Joshi**.

**The following are strictly prohibited without prior written permission from the author:**

- Copying, cloning, or forking this repository for personal, commercial, or academic use
- Reproducing or redistributing any part of this codebase
- Using this project or any portion of it in your own portfolio, product, or application
- Presenting this work as your own in any form

This repository is made public **solely for portfolio viewing and evaluation purposes.**

**Unauthorized use of this codebase may result in legal action under applicable intellectual property and copyright laws.**

For permissions or inquiries: reach out via [LinkedIn](https://www.linkedin.com/in/joshi_nihal10)

---

<p align="center">Built with focus, documented with honesty.</p>