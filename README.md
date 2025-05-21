ecommerce-app/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (user)/
│   │   ├── (vendor)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│
│   ├── components/
│   │   ├── shared/                  # Reusable elements (Navbar, Footer, Button)
│   │   ├── user/                    # User-specific components
│   │   ├── vendor/                  # Vendor-specific components
│   │   └── forms/                   # Reusable forms (login, register, product form)
│
│   ├── context/                     # React context (e.g., Cart, Auth, Toast)
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── VendorContext.tsx
│
│   ├── hooks/                       # Custom hooks
│   │   ├── useAuth.ts               # Get current user/session
│   │   ├── useCart.ts               # Cart actions
│   │   ├── useUpload.ts             # Cloudinary upload logic
│   │   └── useRoleRedirect.ts       # Redirect users by role after login
│
│   ├── lib/                         # Utility functions / setup
│   │   ├── prisma.ts
│   │   ├── cloudinary.ts
│   │   └── auth.ts
│
│   ├── prisma/
│   │   └── schema.prisma
│
│   ├── styles/
│   │   └── globals.css
│
│   ├── types/                       # Global TypeScript types
│   │   └── index.d.ts
│
│   └── middleware.ts               # Role-based redirects
│
├── public/
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json


| Element                     | Recommended Font Size (px) | Notes                                                               |
| --------------------------- | -------------------------- | ------------------------------------------------------------------- |
| **Body text**               | `16–18px`                  | Default readable size for product descriptions, account pages, etc. |
| **Product titles**          | `20–24px`                  | Slightly larger to stand out in listings or details.                |
| **Section headings**        | `24–32px`                  | For categories like "Featured Products", "Recommended for You".     |
| **Main page title (H1)**    | `32–40px`                  | Homepage hero, category header.                                     |
| **Price text**              | `18–24px`                  | Clear and slightly bold; sometimes even larger than product titles. |
| **Buttons**                 | `16–18px`                  | Ensure buttons are readable on all devices.                         |
| **Navigation/Menu items**   | `16–18px`                  | Main nav and mobile drawer.                                         |
| **Product details (small)** | `14–16px`                  | Material, size, shipping info — less prominent but still readable.  |
| **Footer text**             | `12–14px`                  | For legal, terms, copyright.                                        |
