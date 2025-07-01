# 🛍️ E-Commerce Website

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Design Guidelines](#design-guidelines)

## 🌟 Overview
A modern e-commerce platform built with Next.js, featuring both user and vendor interfaces.

## ✨ Features
- 👤 User Authentication
- 🛒 Shopping Cart Management
- 💳 Secure Payment Processing
- 📱 Responsive Design
- 🏪 Vendor Dashboard
- 📦 Order Management
- 🔍 Product Search
- ❤️ Wishlist

## 🗂️ Project Structure
```plaintext
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── (auth)/               # Authentication routes
│   │   ├── (user)/               # User routes
│   │   ├── (vendor)/             # Vendor routes
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   │
│   ├── components/               # React components
│   │   ├── shared/               # Reusable elements
│   │   ├── user/                 # User components
│   │   ├── vendor/               # Vendor components
│   │   └── forms/                # Form components
│   │
│   ├── context/                  # React context
│   │   ├── AuthContext.tsx       # Authentication context
│   │   ├── CartContext.tsx       # Shopping cart context
│   │   └── VendorContext.tsx     # Vendor management
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useCart.ts            # Cart management
│   │   ├── useUpload.ts          # File upload
│   │   └── useRoleRedirect.ts    # Role-based routing
│   │
│   ├── lib/                      # Utility functions
│   │   ├── prisma.ts             # Database client
│   │   ├── cloudinary.ts         # Image upload
│   │   └── auth.ts               # Auth utilities
│   │
│   ├── styles/                   # Global styles
│   │   └── globals.css           # Global CSS
│   │
│   └── utils/                    # Helper functions
│       └── sendMail.js           # Email utilities
│
├── public/                       # Static assets
├── prisma/                       # Database schema
└── package.json                  # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation
1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run development server
```bash
npm run dev
```

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.