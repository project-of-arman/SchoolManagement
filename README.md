# School Management System SaaS

A comprehensive SaaS-based School Management System designed for Bangladeshi schools. Each school gets their own subdomain with a complete website, application system, and management dashboard.

## Features

### 🏫 Multi-Tenant Architecture
- Each school gets a unique URL: `yoursite.com/{schoolSlug}`
- Complete data isolation between schools
- Customizable branding and content per school

### 🌐 Public School Website
- Dynamic landing pages managed by school admins
- Hero carousel with school images
- About section with mission, vision, and stats
- Photo gallery from Cloudinary
- Featured students showcase
- Location and contact information
- Public notice board

### 📝 Student Application System
- No login required for students
- Application types: Transfer Certificate, Fee Discount, General Certificate, Admit Card
- Status tracking: Pending, Approved, Rejected
- Integration with payment verification

### 🔐 Role-Based Authentication
- **Super Admin**: Full system access
- **School Owner**: School management and content editing
- **Teacher**: Class management and result entry
- Secure login with Supabase Auth

### 💳 Payment Integration
- Manual payment verification for bKash/Nagad/Rocket
- Admin approval system
- Balance tracking
- PDF confirmation generation

### 📊 Management Dashboard
- Application management and approval
- Content management (About, Gallery, Notices)
- Teacher management
- Result entry and management
- School statistics and analytics

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary
- **PDF Generation**: jsPDF
- **Deployment**: Vercel/Netlify

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure Supabase:
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Add your Supabase URL, anon key, and service role key to `.env.local`
   - Get your service role key from: Settings -> API -> Project API keys -> service_role key

5. Configure Cloudinary:
   - Create a Cloudinary account
   - Add your cloud name to `.env.local`

6. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Main Tables
- `schools` - Store school information and settings
- `school_content` - Dynamic content for each school section
- `applications` - Student applications and status
- `users` - User accounts with role-based access
- `results` - Student results and grades

### Security
- Row Level Security (RLS) enabled on all tables
- School-level data isolation
- Role-based access control

## Deployment

The application is configured for static export and can be deployed to:
- Vercel
- Netlify
- Any static hosting provider

## Demo

Visit the demo school at: `/demo-school`

## License

MIT License