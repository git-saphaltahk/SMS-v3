# Store Management System (SMS)

> CSIT321 Capstone Project — Group 4, Semester C 2026  
> University of Wollongong, School of Computing and Information Technology

## Project Overview

A full-stack retail store management system built for single-store and multi-store operations. Supports role-based access for customers, cashiers, managers, and administrators.

> Initial demo setup: **v1.0**
> Current release: **v2.0**
> Target release: **v3.0** 

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Java 17 + Spring Boot 3.5 + Spring Security + JWT
- **Database:** MySQL (with PostgreSQL migration planned)
- **AI Layer:** Python service for search and product recommendations
- **Search:** Elasticsearch for advanced customer experience
- **Payment:** Stripe Checkout (test mode)
- **Deployment:** Docker + AWS (planned)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java JDK 17+
- MySQL 8.0+ (running on localhost:3306)
- Elasticsearch 8.x (running on localhost:9200)

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run     # Windows: .\mvnw.cmd spring-boot:run
```

Backend starts on **http://localhost:8082**

> Note: Elasticsearch must be running at `http://localhost:9200`. The backend auto-creates the `products` index.
> The AI recommendation service runs separately at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:5173** (or next available port)

### Database Configuration

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mystore?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
```

The database `mystore` is auto-created on first run. Tables are auto-generated via Hibernate DDL.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@store.com | password123 |
| **Manager** | manager@store.com | password123 |
| **Staff (Cashier)** | staff@store.com | password123 |
| **Customer** | customer@example.com | password123 |

## Features by Role

### Customer
- Browse products by category
- Add items to cart
- Online checkout with Stripe payment
- View order history

### Cashier / Staff
- POS (Point of Sale) checkout
- Record in-store transactions
- View and manage products

### Manager
- Add and edit products
- View users (read-only)
- View orders (read-only)
- **Cannot delete products** (safety restriction)

### Admin (Super Admin)
- Full product management (create, edit, delete)
- User management (view all, delete)
- Complete order viewing
- Full system control panel

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Products
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/products` | Any authenticated |
| GET | `/api/products/{id}` | Any authenticated |
| POST | `/api/products` | Admin, Manager |
| PUT | `/api/products/{id}` | Admin, Manager |
| DELETE | `/api/products/{id}` | Admin only |

### Orders
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/orders` | Any authenticated |
| GET | `/api/orders/{id}` | Any authenticated |
| POST | `/api/customer/orders` | Customer |
| POST | `/api/pos/checkout` | Cashier |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| POST | `/api/payments/{id}/initiate` | Start Stripe checkout |
| GET | `/api/payments/{id}` | Get payment status |
| POST | `/api/stripe/webhook/payment` | Stripe webhook |

### Admin
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/admin/users` | Admin |
| DELETE | `/api/admin/users/{id}` | Admin |

### Manager
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/manager/products` | Manager |
| GET | `/api/manager/orders` | Manager |
| GET | `/api/manager/users` | Manager |

## Project Structure

```
store/
├── backend/                          # Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/example/mystore/
│       ├── MystoreApplication.java    # Entry point
│       ├── api/
│       │   ├── controller/            # REST controllers
│       │   ├── dto/                   # Data transfer objects
│       │   └── mapper/               # Entity-DTO mappers
│       ├── config/                    # Security & Stripe config
│       ├── data/                      # Seed data
│       ├── entity/                    # JPA entities
│       ├── enums/                     # Role & status enums
│       ├── exception/                 # Custom exceptions
│       ├── helper/                    # Utility helpers
│       ├── repo/                      # JPA repositories
│       ├── security/                  # User details service
│       ├── service/                   # Business logic
│       └── utility/                   # JWT service & filter
├── frontend/                          # React + Vite app
│   ├── src/app/
│   │   ├── App.tsx                    # Root component
│   │   ├── routes.tsx                 # Role-based routing
│   │   ├── components/ui/             # shadcn/ui components
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API & auth services
│   │   └── data/                      # Default product data
│   └── package.json
└── README.md
```

## Troubleshooting

**Backend won't start:**
- Ensure MySQL is running on port 3306
- Check database credentials in `application.properties`
- Run `./mvnw clean compile` to verify compilation

**Frontend shows blank page:**
- Refresh browser and check Vite terminal output
- Verify backend is running on `http://localhost:8082`
- Check browser DevTools Console/Network for errors

**API calls fail with 401:**
- JWT token expired (valid 24 hours)
- Log out and log in again
- Ensure `Authorization: Bearer <token>` header is sent

**CORS errors:**
- Frontend must run on `localhost:5173` or `localhost:5174`
- Backend CORS allows only these origins in dev mode

**Elasticsearch errors:**
- Start Elasticsearch at `http://localhost:9200` before the backend

**Stripe test payment:**
- Use test card: `4242 4242 4242 4242`
- Expiry: any future date (e.g. 12/28)
- CVC: any 3 digits


### Why Elasticsearch and Python?

- Elasticsearch powers fast, scalable product search and relevance ranking across large catalogs.
- The Python AI service adds a lightweight recommendation layer that enriches product discovery with personalized, data-driven suggestions.
- Together they make the store feel more responsive, intelligent, and delightful for shoppers.

### v3.0 Checklist (5 of 7)

- [ ] Add Elasticsearch support for product indexing and search queries
- [ ] Build a Python AI service to serve product recommendations
- [ ] Integrate frontend product UI with the AI recommendation service
- [ ] Connect backend product endpoints to Elasticsearch search results
- [ ] Define API contract between Java backend and Python AI service

### Additional v3.0 items

- [ ] Docker containerization for frontend, backend, Python AI service, and Elasticsearch
- [ ] AWS deployment planning for full v3.0 stack
- [ ] Redis caching layer
- [ ] PostgreSQL migration
- [ ] Email service integration
- [ ] Two-factor authentication
- [ ] Social OAuth login

## Responsive Design & Small-Screen Styling

- This application uses a responsive web design approach (Tailwind CSS + utility classes) to provide a smooth experience across desktop and small-screen browsers. It is optimized for mobile browsers but is not a native mobile app.
- Key responsive considerations:
	- Fluid layouts and grid breakpoints ensure product cards and recommendation lists adapt to narrow viewports.
	- Use compact navigation and collapsed hero content on small screens to prioritize product discovery.
	- Images use responsive size hints; prefer serving appropriately sized images for low-bandwidth devices.

CSS tips for small screens:

- Consider adding or customizing `src/styles/theme.css` or `src/styles/globals.css` with the following utilities:

```css
/* Example: compact product card spacing for small screens */
@media (max-width: 640px) {
	.product-card { padding: 0.75rem; }
	.hero-title { font-size: 1.5rem; }
	.recommendation-grid { grid-template-columns: repeat(2, 1fr); }
}
```

- Test responsiveness using browser DevTools device toolbar and by resizing the window; the UI is built to be touch-friendly but remains a web application.


## Quick Start

Follow these commands to start the core services used during development (Elasticsearch, backend, Python AI service, and frontend). Adjust paths and OS-specific commands as needed.

1) Start Elasticsearch (Docker)

```bash
# Single-node Elasticsearch (Docker)
docker run --name elasticsearch -d -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

2) Start the Java backend

```bash
# From the repo root or backend directory (Windows)
cd backend
.\mvnw.cmd spring-boot:run

# Or on macOS/Linux
./mvnw spring-boot:run
```

3) Start the Python AI recommendation service

```bash
cd python-ai-service
# create venv (optional)
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt    # Windows
# or on macOS/Linux: .venv/bin/python -m pip install -r requirements.txt

# Run the FastAPI service
.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 5000    # Windows
# or on macOS/Linux: .venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 5000
```

4) Start the frontend (development)

```bash
cd frontend
npm install
npm run dev

# Build for production
npm run build
```

Health checks and quick tests

```bash
# Elasticsearch
curl http://localhost:9200/

# Python AI service
curl -X POST http://127.0.0.1:5000/recommendations -H 'Content-Type: application/json' -d '{"userId":1, "products": []}'

# Backend
curl http://localhost:8082/actuator/health

# Frontend (if running dev server)
# open http://localhost:5173/ (or the Vite dev URL shown in the console)
```

Notes

- Backend default port: `8082` (see `backend/src/main/resources/application.properties`).
- Python AI service: `http://localhost:5000`.
- Elasticsearch: `http://localhost:9200`.
