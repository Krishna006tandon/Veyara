# Veyara - 10-Minute Hyperlocal Delivery Platform

Veyara is a hyperlocal delivery platform focused on ultra-fast 10-minute delivery of clothing and groceries. The platform connects customers with nearby dark stores for quick and reliable delivery.

## 🎯 Current Status

**✅ Implemented:**
- Backend API with authentication
- React Native frontend with auth flow
- Expo version of the app
- Admin dashboard structure
- Database schema with Prisma
- Real-time socket connections
- Location services integration

**🚧 In Progress:**
- Main app screens (Home, Search, Orders, Profile)
- Restaurant/store listings
- Cart functionality
- Order tracking
- Payment integration

**📋 Planned:**
- Delivery partner app
- Store management interface
- Advanced analytics dashboard
- Push notifications
- Rating system

## 🚀 Features

### Core Features
- **Ultra-fast 10-minute delivery**
- **Nearby dark stores**
- **Limited high-demand inventory**
- **Real-time order tracking**
- **Multiple user roles**

### User Roles
1. **Customer** - Browse products, place orders, track deliveries
2. **Store (Dark Store)** - Manage inventory, process orders, track performance
3. **Delivery Partner** - Accept deliveries, track earnings, manage routes
4. **Admin** - Monitor platform, manage users, handle disputes

## 🏗️ Architecture

### Backend (Node.js + TypeScript + Prisma)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth
- **Real-time**: Socket.IO for live tracking
- **Validation**: Joi for request validation
- **File Upload**: Multer with Sharp for image processing

### Frontend Applications
- **Customer App**: React Native
- **Store Management**: Web application
- **Delivery Partner App**: React Native
- **Admin Dashboard**: Next.js

## 📁 Project Structure

```
veyara/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.IO handlers
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema
│   └── uploads/             # File uploads
├── frontend/                # Customer React Native app
│   ├── src/
│   │   ├── contexts/        # React contexts (Auth, Theme, Location, Socket)
│   │   ├── navigation/      # Navigation components
│   │   ├── screens/         # App screens
│   │   │   ├── auth/        # Authentication screens
│   │   │   └── main/        # Main app screens
│   │   └── store/           # Redux store
├── veyara-expo/            # Expo version of customer app
│   ├── src/
│   │   ├── contexts/        # React contexts
│   │   ├── navigation/      # Navigation components
│   │   └── screens/         # App screens
├── admin-dashboard/         # Next.js admin dashboard
├── .gitignore              # Git ignore file
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: Joi
- **File Processing**: Multer, Sharp

### Integrations
- **Payments**: Razorpay
- **SMS**: Twilio
- **Maps**: Google Maps API
- **Push Notifications**: Firebase

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis (optional, for caching)
- Expo CLI (for mobile development)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd veyara
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

5. **Start the backend server**
```bash
cd backend
npm run dev
```

The API server will be available at `http://localhost:3001`

### Frontend Setup

#### React Native App (frontend/)
```bash
cd frontend
npm install
# For iOS
npx pod-install
# Start the app
npx react-native start
```

#### Expo App (veyara-expo/)
```bash
cd veyara-expo
npm install
# Start the Expo development server
npx expo start
# Scan QR code with Expo Go app on your phone
```

#### Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```

### Quick Start Commands

```bash
# Start all services (run in separate terminals)
cd backend && npm run dev           # Backend API
cd frontend && npx react-native start  # React Native App
cd veyara-expo && npx expo start    # Expo App
cd admin-dashboard && npm run dev   # Admin Dashboard
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

### Stores
- `GET /api/stores/nearby` - Get nearby stores
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create store (store owner/admin)
- `PUT /api/stores/:id` - Update store
- `GET /api/stores/:id/inventory` - Get store inventory

### Products
- `GET /api/products/store/:storeId` - Get products by store
- `GET /api/products/:id` - Get product details
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (store owner)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Delivery
- `GET /api/delivery/requests` - Get delivery requests
- `POST /api/delivery/accept/:orderId` - Accept delivery
- `PUT /api/delivery/location/:orderId` - Update location
- `PUT /api/delivery/complete/:orderId` - Complete delivery

## 🔐 Security Features

- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js for security headers
- Password hashing with bcrypt

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Customer, store owners, delivery partners, admins
- **Stores** - Dark store information and settings
- **Products** - Product catalog with variants
- **Inventory** - Store-specific product inventory
- **Orders** - Customer orders and status tracking
- **Deliveries** - Delivery assignments and tracking
- **Payments** - Payment processing and records
- **Reviews** - Customer feedback and ratings

## 🚀 Deployment

### Environment Variables
Key environment variables required:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
RAZORPAY_KEY_ID="rzp_..."
RAZORPAY_KEY_SECRET="..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
GOOGLE_MAPS_API_KEY="..."
```

### Production Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build the application
5. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team.

---

Built with ❤️ for ultra-fast hyperlocal delivery
