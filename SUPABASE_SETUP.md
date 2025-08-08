# ChargeSource Supabase Integration

This guide will help you set up Supabase as the backend for your ChargeSource platform.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name (e.g., "chargesource-portal")
3. Set a strong database password
4. Wait for the project to be created

### 2. Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**
4. Copy your **service_role key** (keep this secret!)

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy from .env.example and fill in your values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Run Database Migrations

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref your-project-id

# Push the schema to your database
supabase db push
```

### 5. Initialize Sample Data

```bash
# Run the setup script
node scripts/setup-supabase.js
```

### 6. Start Development

```bash
npm run dev
```

## 📋 Database Schema

The platform uses the following main tables:

### Users Table
- Stores user profiles and roles
- Integrated with Supabase Auth
- Supports 5 role levels: Global Admin, Admin, Sales, Partner, User

### Projects Table
- Project management data
- Client requirements and site assessments
- Progress tracking and budget estimates

### Quotes Table
- Quote generation and management
- Line items and pricing calculations
- Status tracking and client interactions

### Products Table
- Product catalog with specifications
- Pricing and inventory management
- Supplier information and documents

### Global Settings Table
- System-wide configuration
- Business rules and pricing settings
- Feature toggles and integrations

## 🔒 Row Level Security (RLS)

The database uses Row Level Security to ensure users can only access their own data:

- **Users**: Can view/edit own profile, admins can manage all users
- **Projects**: Users see own projects, admins see all projects
- **Quotes**: Users see own quotes, sales/admin roles have broader access
- **Products**: All authenticated users can view, admins can manage
- **Settings**: Global admins only for system settings

## 🔧 Edge Functions

The platform includes several Edge Functions for server-side logic:

### generate-quote-pdf
- Converts quotes to PDF documents
- Handles professional formatting and styling
- Requires authentication

### calculate-quote-totals
- Performs complex pricing calculations
- Applies volume discounts and business rules
- Ensures accurate totals and taxes

## 📱 Real-time Features

Supabase provides real-time updates for:

- **Quote Collaboration**: Multiple users can work on quotes simultaneously
- **Project Updates**: Team members see live project progress
- **Inventory Changes**: Stock levels update across all users
- **Notifications**: Instant alerts for important events

## 🔄 Migration from localStorage

The platform includes an automatic migration system:

1. **Detection**: Automatically detects existing localStorage data
2. **Migration UI**: User-friendly interface for data migration
3. **Backup**: Original data is preserved during migration
4. **Validation**: Ensures data integrity during transfer

To trigger migration:
1. Log in to the platform
2. Go to Dashboard
3. Look for the "Migrate to Cloud" prompt
4. Click "Start Migration" and follow the prompts

## 🛠️ Development Workflow

### Local Development with Supabase

```bash
# Start Supabase locally (optional)
supabase start

# Run your application
npm run dev

# Make database changes
supabase db diff --file=new_migration
supabase db push
```

### Working with Edge Functions

```bash
# Create a new Edge Function
supabase functions new my-function

# Deploy functions
supabase functions deploy

# View function logs
supabase functions logs
```

## 🔧 Configuration Options

### Authentication Settings

In your Supabase dashboard under **Authentication** → **Settings**:

- **Site URL**: `http://localhost:5173` (development)
- **Redirect URLs**: Add your production domain
- **Email Templates**: Customize signup/recovery emails
- **Social Providers**: Configure OAuth if needed

### Storage Settings

Configure file uploads in **Storage**:

- **Product Images**: Public bucket for product photos
- **Documents**: Private bucket for contracts/docs
- **Quote Attachments**: Private bucket for quote files

### API Settings

- **Auto API Documentation**: Enabled
- **GraphQL**: Enabled for advanced queries
- **Realtime**: Enabled for live updates

## 🚀 Production Deployment

### Environment Variables

For production, set these environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Database Backups

Supabase automatically backs up your database:
- **Point-in-time recovery**: Available for 7 days (Pro plan)
- **Manual backups**: Can be triggered from dashboard
- **Export options**: SQL dumps available

### Monitoring

Monitor your application through:
- **Supabase Dashboard**: Database metrics and logs
- **Edge Function Logs**: Server-side function monitoring
- **API Analytics**: Request patterns and performance

## 🆘 Troubleshooting

### Common Issues

**Migration Fails**
- Check internet connection
- Verify Supabase credentials
- Ensure database permissions are correct

**RLS Policies Blocking Access**
- Verify user role is set correctly
- Check if policies match your use case
- Use service role key for admin operations

**Edge Functions Not Working**
- Check function deployment status
- Verify environment variables
- Review function logs for errors

### Getting Help

1. **Documentation**: [supabase.com/docs](https://supabase.com/docs)
2. **Community**: [GitHub Discussions](https://github.com/supabase/supabase/discussions)
3. **Support**: Available through Supabase dashboard

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/design)

---

## 🎯 Next Steps

After setting up Supabase:

1. **Test the Migration**: Use the migration tool to move your existing data
2. **Invite Team Members**: Add users and assign appropriate roles
3. **Configure Integrations**: Set up email, SMS, and payment providers
4. **Monitor Performance**: Watch database metrics and optimize queries
5. **Plan Scaling**: Consider upgrading Supabase plan as you grow

Your ChargeSource platform is now powered by Supabase! 🎉
