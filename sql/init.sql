-- HARSLE Stock Machine Database Initialization Script
-- This script creates all necessary tables and RLS policies for the application

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ADMIN USERS TABLE
-- =============================================
-- Table to manage admin users with role-based access
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- MACHINES TABLE
-- =============================================
-- Table to store machine inventory information
CREATE TABLE public.machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model VARCHAR(255) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    production_date DATE NOT NULL,
    specifications JSONB DEFAULT '{}',
    tooling_drawing_url VARCHAR(500),
    image_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- BANNERS TABLE
-- =============================================
-- Table to store homepage banner information
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    background_image_url VARCHAR(500),
    background_style VARCHAR(50) DEFAULT 'slide-bg-1',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- INQUIRIES TABLE
-- =============================================
-- Table to store customer inquiries
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    message TEXT NOT NULL,
    product_model VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'replied', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INQUIRY REPLIES TABLE
-- =============================================
-- Table to store admin replies to inquiries
CREATE TABLE public.inquiry_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id),
    sender_type VARCHAR(20) DEFAULT 'admin' CHECK (sender_type IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_machines_model ON public.machines(model);
CREATE INDEX idx_machines_created_at ON public.machines(created_at);
CREATE INDEX idx_banners_active ON public.banners(is_active);
CREATE INDEX idx_banners_order ON public.banners(display_order);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at);
CREATE INDEX idx_inquiry_replies_inquiry_id ON public.inquiry_replies(inquiry_id);

-- =============================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON public.machines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_replies ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ADMIN_USERS RLS POLICIES
-- =============================================
-- Only admins can read admin_users table
CREATE POLICY admin_users_select_policy ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can insert new admin users
CREATE POLICY admin_users_insert_policy ON public.admin_users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can update admin users
CREATE POLICY admin_users_update_policy ON public.admin_users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can delete admin users
CREATE POLICY admin_users_delete_policy ON public.admin_users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- =============================================
-- MACHINES RLS POLICIES
-- =============================================
-- Public read access for frontend display
CREATE POLICY machines_select_policy ON public.machines
    FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Only admins can insert machines
CREATE POLICY machines_insert_policy ON public.machines
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can update machines
CREATE POLICY machines_update_policy ON public.machines
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can delete machines
CREATE POLICY machines_delete_policy ON public.machines
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- =============================================
-- BANNERS RLS POLICIES
-- =============================================
-- Public read access for frontend display
CREATE POLICY banners_select_policy ON public.banners
    FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Only admins can insert banners
CREATE POLICY banners_insert_policy ON public.banners
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can update banners
CREATE POLICY banners_update_policy ON public.banners
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can delete banners
CREATE POLICY banners_delete_policy ON public.banners
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- =============================================
-- INQUIRIES RLS POLICIES
-- =============================================
-- Public can create inquiries
CREATE POLICY inquiries_insert_policy ON public.inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (TRUE);

-- Only admins can read inquiries
CREATE POLICY inquiries_select_policy ON public.inquiries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can update inquiries
CREATE POLICY inquiries_update_policy ON public.inquiries
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can delete inquiries
CREATE POLICY inquiries_delete_policy ON public.inquiries
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- =============================================
-- INQUIRY_REPLIES RLS POLICIES
-- =============================================
-- Only admins can read inquiry replies
CREATE POLICY inquiry_replies_select_policy ON public.inquiry_replies
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can create inquiry replies
CREATE POLICY inquiry_replies_insert_policy ON public.inquiry_replies
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can update inquiry replies
CREATE POLICY inquiry_replies_update_policy ON public.inquiry_replies
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- Only admins can delete inquiry replies
CREATE POLICY inquiry_replies_delete_policy ON public.inquiry_replies
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- =============================================
-- SEED DATA
-- =============================================
-- Insert initial admin user (you'll need to update this with actual user_id after registration)
-- INSERT INTO public.admin_users (user_id, email, name, is_admin) 
-- VALUES (
--     'your-actual-user-id-here',
--     'admin@harsle.com',
--     'Administrator',
--     TRUE
-- );

-- Insert sample machines data
INSERT INTO public.machines (model, stock, production_date, specifications, tooling_drawing_url, image_urls) VALUES
('MasterBend 11025', 3, '2025-06-01', '{"bendingTonnage": "110 Tons", "bendingLength": "2500 mm", "operatingSystem": "DA-66T CNC System", "backgaugeAxis": "X+R+Z1+Z2"}', 'https://www.example.com/tooling/masterbend-11025.pdf', '{"https://images.unsplash.com/photo-1581092918484-8313ada2d32a?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581092918482-d8b6b7b1c568?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"}'),
('PowerPress 16030', 2, '2025-05-01', '{"bendingTonnage": "160 Tons", "bendingLength": "3000 mm", "operatingSystem": "Estun E21 CNC System", "backgaugeAxis": "X+R+Z1+Z2+V"}', 'https://www.example.com/tooling/powerpress-16030.pdf', '{"https://images.unsplash.com/photo-1565087681768-14d5d4a84574?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581092917954-4eb1f65ed5de?w=600&h=400&fit=crop"}'),
('FlexiBend 8025', 5, '2025-07-01', '{"bendingTonnage": "80 Tons", "bendingLength": "2500 mm", "operatingSystem": "Delem DA-58T CNC System", "backgaugeAxis": "X+R+Z1+Z2"}', 'https://www.example.com/tooling/flexibend-8025.pdf', '{"https://images.unsplash.com/photo-1581092917909-35b8bb9e9e80?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1565087681767-bb3c7b4eb26f?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581092917849-d8b6b7b1c567?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1559827260-dc66d52bef18?w=600&h=400&fit=crop"}'),
('PrecisionBend 20040', 1, '2025-04-01', '{"bendingTonnage": "200 Tons", "bendingLength": "4000 mm", "operatingSystem": "Cybelec DNC-880S CNC System", "backgaugeAxis": "X+R+Z1+Z2+V+W"}', 'https://www.example.com/tooling/precisionbend-20040.pdf', '{"https://images.unsplash.com/photo-1581092334651-ddf26d9a09d8?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1565087681768-f4eb1f65ed5c?w=600&h=400&fit=crop"}'),
('HeavyDuty 30050', 4, '2025-03-01', '{"bendingTonnage": "300 Tons", "bendingLength": "5000 mm", "operatingSystem": "ESA S630 CNC System", "backgaugeAxis": "X+R+Z1+Z2+V+W+B"}', 'https://www.example.com/tooling/heavyduty-30050.pdf', '{"https://images.unsplash.com/photo-1581092917963-4eb1f65ed5df?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1565087681767-bb3c7b4eb26e?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581092917877-d8b6b7b1c569?w=600&h=400&fit=crop"}'),
('CompactBend 6020', 8, '2025-08-01', '{"bendingTonnage": "60 Tons", "bendingLength": "2000 mm", "operatingSystem": "Delem DA-53T CNC System", "backgaugeAxis": "X+R+Z1+Z2"}', 'https://www.example.com/tooling/compactbend-6020.pdf', '{"https://images.unsplash.com/photo-1581092917838-d8b6b7b1c566?w=600&h=400&fit=crop"}'),
('IndustrialMax 25060', 2, '2025-02-01', '{"bendingTonnage": "250 Tons", "bendingLength": "6000 mm", "operatingSystem": "Estun E300P CNC System", "backgaugeAxis": "X+R+Z1+Z2+V+W+B+T"}', 'https://www.example.com/tooling/industrialmax-25060.pdf', '{"https://images.unsplash.com/photo-1581092917952-4eb1f65ed5dd?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1565087681767-bb3c7b4eb26d?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581092917866-d8b6b7b1c568?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1559827260-dc66d52bef17?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581092917945-4eb1f65ed5dc?w=600&h=400&fit=crop"}');

-- Insert sample banners data
INSERT INTO public.banners (title, subtitle, background_style, is_active, display_order) VALUES
('HARSLE Inventory Machines', 'Professional Press Brake Solutions Ready For Delivery', 'slide-bg-1', TRUE, 1),
('Advanced Manufacturing Excellence', 'Cutting-Edge Industrial Equipment for Modern Production', 'slide-bg-2', TRUE, 2),
('Precision Engineering Solutions', 'High-Performance Bending Machines for Superior Results', 'slide-bg-3', TRUE, 3);

-- =============================================
-- FUNCTIONS AND PROCEDURES
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.user_id = $1 AND au.is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with admin status
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    is_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.name,
        au.is_admin,
        au.created_at,
        au.last_login
    FROM public.admin_users au
    WHERE au.user_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login time
CREATE OR REPLACE FUNCTION public.update_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.admin_users
    SET last_login = NOW()
    WHERE user_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKET SETUP
-- =============================================
-- Note: This would typically be done through the Supabase dashboard
-- The 'library' bucket should already exist as mentioned in requirements

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.admin_users IS 'Stores admin user information and permissions';
COMMENT ON TABLE public.machines IS 'Stores machine inventory with specifications and images';
COMMENT ON TABLE public.banners IS 'Stores homepage banner content and settings';
COMMENT ON TABLE public.inquiries IS 'Stores customer inquiries and quote requests';
COMMENT ON TABLE public.inquiry_replies IS 'Stores admin replies to customer inquiries';

COMMENT ON COLUMN public.machines.specifications IS 'JSONB field storing flexible machine specifications';
COMMENT ON COLUMN public.machines.image_urls IS 'Array of image URLs from Supabase storage';
COMMENT ON COLUMN public.banners.background_image_url IS 'URL to uploaded background image in storage';
COMMENT ON COLUMN public.banners.background_style IS 'CSS class name for background styling'; 