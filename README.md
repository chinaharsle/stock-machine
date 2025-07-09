# HARSLE Stock Machine Management System

<p align="center">
  <strong>Professional Industrial Equipment Inventory Management System</strong>
</p>

<p align="center">
  A comprehensive web application for managing press brake and sheet metal equipment inventory with customer inquiry management.
</p>

## 🚀 Features

### Frontend (Public Website)
- **Product Showcase**: Browse available press brake machines with detailed specifications
- **Interactive Image Gallery**: View product images with zoom functionality and navigation
- **Smart Inquiry System**: Submit product inquiries with automatic IP geolocation
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Toast Notifications**: Enhanced user feedback with confetti effects
- **Product Specifications Display**: Detailed technical parameters for each machine

### Backend (Admin Dashboard)
- **Secure Authentication**: Role-based access control for administrators
- **Machine Management**: Add, edit, and organize inventory with custom specifications
- **Inquiry Management**: Handle customer inquiries with status tracking and product parameter integration
- **Geographic Analytics**: Track inquiry sources with IP address and country detection
- **Banner Management**: Control homepage banners and promotional content
- **User Administration**: Manage admin accounts and permissions
- **Media Library**: Centralized file management for images and documents

### Technical Features
- **Modern Stack**: Built with Next.js 15, TypeScript, and Supabase
- **Database Integration**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage for images and documents
- **API Architecture**: RESTful APIs with comprehensive error handling
- **Security**: JWT authentication with server-side validation
- **Performance**: Optimized images, caching, and lazy loading

## 🛠 Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with cookies
- **Storage**: Supabase Storage
- **Deployment**: Vercel-ready
- **UI Components**: Custom components with shadcn/ui

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-machine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Rename `.env.example` to `.env.local` and configure:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   
   Run the initialization script in your Supabase SQL editor:
   ```bash
   # Execute sql/init.sql in Supabase dashboard
   ```
   
   For IP address and country tracking, also run:
   ```bash
   # Execute sql/add-ip-country-fields.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

## 🗄 Database Schema

### Core Tables
- **machines**: Product inventory with specifications and images
- **inquiries**: Customer inquiries with contact information and IP tracking
- **admin_users**: Administrator accounts with role management
- **banners**: Homepage banner management
- **inquiry_replies**: Admin responses to customer inquiries

### Key Features
- UUID primary keys for security
- Row Level Security (RLS) policies
- JSONB specifications for flexible product data
- Automatic timestamp tracking
- Geographic IP tracking (with optional fields)

## 🚀 Deployment

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL initialization scripts
3. Configure authentication settings
4. Set up storage buckets for file uploads

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 📱 Usage

### For Administrators
1. **Access Admin Dashboard**: Navigate to `/auth/login`
2. **Manage Inventory**: Add/edit machines with specifications and images
3. **Handle Inquiries**: View, respond to, and track customer inquiries
4. **Monitor Analytics**: Review inquiry sources and customer patterns

### For Customers
1. **Browse Products**: View available machines on the homepage
2. **Request Quotes**: Submit inquiries for specific products
3. **View Details**: Examine product specifications and images

## 🔧 Configuration

### Admin Setup
1. Create your first admin user via Supabase Auth
2. Update the admin_users table with your user ID
3. Set `is_admin = true` for administrative access

### Customization
- **Product Categories**: Modify machine specifications in the database
- **UI Themes**: Customize colors in CSS variables
- **Email Integration**: Configure SMTP for inquiry notifications
- **Geographic Services**: Update IP geolocation API endpoints

## 📚 API Documentation

### Public APIs
- `GET /api/machines/by-model?model=<name>` - Get machine specifications
- `POST /api/inquiries` - Submit customer inquiry

### Admin APIs
- `GET /api/inquiries/list` - List all inquiries with filtering
- `PUT /api/inquiries/[id]` - Update inquiry status
- `DELETE /api/inquiries/[id]` - Remove inquiry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for HARSLE industrial equipment management.

## 🆘 Support

For technical support or questions:
- Review the `DATABASE_UPDATE_INSTRUCTIONS.md` for database setup
- Check the terminal logs for debugging information
- Ensure all environment variables are properly configured

---

**Built with ❤️ for HARSLE industrial equipment management**
