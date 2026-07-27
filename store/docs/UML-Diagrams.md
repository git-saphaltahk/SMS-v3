# Store Management System — UML Diagrams

## 1. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STORE MANAGEMENT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐                           ┌──────────────┐               │
│  │ Customer │──────────────────────────▶│ Browse Products│              │
│  └──────────┘                           └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       ├─────────────────────────────────▶│  Add to Cart  │              │
│       │                                  └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       ├─────────────────────────────────▶│  Place Order  │              │
│       │                                  └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       ├─────────────────────────────────▶│Stripe Payment │              │
│       │                                  └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       └─────────────────────────────────▶│Order History  │              │
│                                          └──────────────┘               │
│                                                                         │
│  ┌──────────┐                           ┌──────────────┐               │
│  │ Cashier  │──────────────────────────▶│ POS Checkout  │              │
│  └──────────┘                           └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       ├─────────────────────────────────▶│Record Trans.  │              │
│       │                                  └──────────────┘               │
│       └─────────────────────────────────▶│ View Products │              │
│                                          └──────────────┘               │
│                                                                         │
│  ┌──────────┐                           ┌──────────────┐               │
│  │ Manager  │──────────────────────────▶│Add/Edit Prod. │              │
│  └──────────┘                           └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       ├─────────────────────────────────▶│ View Users    │              │
│       │                                  └──────────────┘               │
│       ├─────────────────────────────────▶│ View Orders   │              │
│       │                                  └──────────────┘               │
│       └─────────────────────────────────▶│ Sales Stats   │              │
│       ❌ CANNOT Delete Products          └──────────────┘               │
│                                                                         │
│  ┌──────────┐                           ┌──────────────┐               │
│  │  Admin   │──────────────────────────▶│Delete Products│              │
│  └──────────┘                           └──────────────┘               │
│       │                                  ┌──────────────┐               │
│       ├─────────────────────────────────▶│Delete Users   │              │
│       │                                  └──────────────┘               │
│       └─────────────────────────────────▶│Full Dashboard │              │
│       (inherits all Manager permissions) └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Class Diagram

```
┌──────────────────┐       ┌──────────────────┐      ┌──────────────────┐
│      User        │       │     Product      │      │      Order       │
├──────────────────┤       ├──────────────────┤      ├──────────────────┤
│ - id: Long       │       │ - id: Long       │      │ - id: Long       │
│ - email: String  │       │ - name: String   │      │ - customer: User │
│ - passwordHash   │       │ - price:BigDecimal│     │ - cashier: User  │
│ - role: Role     │       │ - category:String│      │ - orderSource    │
│ - active: boolean│       │ - stockQuantity  │      │ - orderStatus    │
│ - resetToken     │       │ - imageName      │      │ - paymentStatus  │
│ - createdAt      │       │ - active: boolean│      │ - subtotalTotal  │
│ - updatedAt      │       └──────────────────┘      │ - discountPercent│
└──────────────────┘                                 │ - discountAmount │
         │ 1                                         │ - grandTotal     │
         │                                           │ - createdAt      │
         │ *                                         └──────────────────┘
         ▼                                                   │ 1
┌──────────────────┐                                         │
│    Payment       │                                         │ *
├──────────────────┤                                         ▼
│ - id: Long       │                              ┌──────────────────┐
│ - order: Order   │                              │    OrderItem     │
│ - user: User     │                              ├──────────────────┤
│ - amount         │                              │ - id: Long       │
│ - paymentStatus  │                              │ - order: Order   │
│ - stripeSessionId│                              │ - product:Product│
│ - stripePIId     │                              │ - unitPriceAtTime│
│ - createdAt      │                              │ - quantity: int  │
│ - completedAt    │                              │ - lineTotal      │
└──────────────────┘                              └──────────────────┘

Enums:
  Role: { ADMIN, MANAGER, CASHIER, CUSTOMER }
  OrderSource: { CUSTOMER_PORTAL, POS }
  OrderStatus: { PLACED, FULFILLED }
  PaymentStatus: { UNPAID, PENDING, COMPLETED, FAILED, EXPIRED, CANCELLED }
```

## 3. Sequence Diagram — Customer Order + Payment Flow

```
Customer      React Frontend     Spring Boot API     MySQL/Stripe
  │                │                   │                  │
  │  1. Login      │                   │                  │
  │───────────────▶│                   │                  │
  │                │   POST /api/auth/ │                  │
  │                │      login        │                  │
  │                │──────────────────▶│                  │
  │                │                   │  verify password │
  │                │                   │─────────────────▶│
  │                │    JWT token      │                  │
  │                │◀──────────────────│                  │
  │                │                   │                  │
  │  2. Browse     │                   │                  │
  │───────────────▶│                   │                  │
  │                │ GET /api/products │                  │
  │                │──────────────────▶│                  │
  │                │   product list    │                  │
  │                │◀──────────────────│                  │
  │                │                   │                  │
  │  3. Place Order│                   │                  │
  │───────────────▶│                   │                  │
  │                │POST /api/customer/│                  │
  │                │     orders        │                  │
  │                │──────────────────▶│                  │
  │                │                   │  check stock     │
  │                │                   │─────────────────▶│
  │                │                   │  if insufficient │
  │                │                   │◀─────────────────│
  │                │                   │  throw error     │
  │                │                   │  if ok: save     │
  │                │                   │─────────────────▶│
  │                │   order created   │                  │
  │                │◀──────────────────│                  │
  │                │                   │                  │
  │  4. Pay        │                   │                  │
  │───────────────▶│                   │                  │
  │                │POST /api/payments │                  │
  │                │──────────────────▶│                  │
  │                │                   │  create Stripe   │
  │                │                   │  checkout session│
  │                │                   │─────────────────▶│ Stripe
  │                │ checkout URL      │                  │
  │                │◀──────────────────│                  │
  │                │                   │                  │
  │  Redirect to Stripe Checkout       │                  │
  │──────────────────────────────────────────────────────▶│
  │                │                   │  webhook callback│
  │                │                   │◀─────────────────│
  │                │                   │  update payment  │
  │                │                   │  status=COMPLETED│
  │                │                   │─────────────────▶│
  │                │                   │                  │
  │  Payment Success Page              │                  │
  │◀──────────────────────────────────────────────────────│
```
