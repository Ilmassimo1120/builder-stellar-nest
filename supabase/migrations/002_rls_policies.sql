-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM users 
        WHERE id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or higher
CREATE OR REPLACE FUNCTION is_admin_or_higher(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_uuid) IN ('admin', 'global_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is global admin
CREATE OR REPLACE FUNCTION is_global_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_uuid) = 'global_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Global admins can delete users" ON users
    FOR DELETE 
    USING (is_global_admin(auth.uid()));

-- Projects table policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can update all projects" ON projects
    FOR UPDATE 
    USING (is_admin_or_higher(auth.uid()));

-- Quotes table policies
CREATE POLICY "Users can view own quotes" ON quotes
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes" ON quotes
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON quotes
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON quotes
    FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotes" ON quotes
    FOR SELECT 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can update all quotes" ON quotes
    FOR UPDATE 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Sales can view all quotes" ON quotes
    FOR SELECT 
    USING (get_user_role(auth.uid()) IN ('sales', 'admin', 'global_admin'));

-- Products table policies
CREATE POLICY "All authenticated users can view active products" ON products
    FOR SELECT 
    USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can view all products" ON products
    FOR SELECT 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can create products" ON products
    FOR INSERT 
    WITH CHECK (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE 
    USING (is_admin_or_higher(auth.uid()));

-- Global settings policies
CREATE POLICY "Authenticated users can view settings" ON global_settings
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Global admins can manage settings" ON global_settings
    FOR ALL 
    USING (is_global_admin(auth.uid()));

-- Partner configs policies
CREATE POLICY "Users can view own partner config" ON partner_configs
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own partner config" ON partner_configs
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner config" ON partner_configs
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all partner configs" ON partner_configs
    FOR SELECT 
    USING (is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can update all partner configs" ON partner_configs
    FOR UPDATE 
    USING (is_admin_or_higher(auth.uid()));

-- Quote templates policies
CREATE POLICY "Authenticated users can view templates" ON quote_templates
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create templates" ON quote_templates
    FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON quote_templates
    FOR UPDATE 
    USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all templates" ON quote_templates
    FOR ALL 
    USING (is_admin_or_higher(auth.uid()));

-- Activity logs policies
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view all activity logs" ON activity_logs
    FOR SELECT 
    USING (is_admin_or_higher(auth.uid()));

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email LIKE '%globaladmin%' THEN 'global_admin'::user_role
            WHEN NEW.email LIKE '%admin%' THEN 'admin'::user_role
            WHEN NEW.email LIKE '%sales%' OR NEW.email LIKE '%sale%' THEN 'sales'::user_role
            WHEN NEW.email LIKE '%partner%' THEN 'partner'::user_role
            ELSE 'user'::user_role
        END,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
