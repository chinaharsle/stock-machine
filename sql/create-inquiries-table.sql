-- 创建询盘表
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    message TEXT NOT NULL,
    product_model VARCHAR(255),
    ip_address VARCHAR(45), -- 支持IPv4和IPv6
    country VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'replied', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by UUID REFERENCES auth.users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_product_model ON inquiries(product_model);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建RLS策略
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有询盘
CREATE POLICY "Admins can view all inquiries" ON inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- 管理员可以更新所有询盘
CREATE POLICY "Admins can update all inquiries" ON inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- 管理员可以删除所有询盘
CREATE POLICY "Admins can delete all inquiries" ON inquiries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- 允许匿名用户插入询盘（通过Edge Function）
CREATE POLICY "Allow anonymous insert via service role" ON inquiries
    FOR INSERT WITH CHECK (true);

-- 创建询盘回复表
CREATE TABLE IF NOT EXISTS inquiry_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('admin', 'customer')),
    sender_id UUID REFERENCES auth.users(id), -- 仅当sender_type='admin'时有值
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建回复表索引
CREATE INDEX IF NOT EXISTS idx_inquiry_replies_inquiry_id ON inquiry_replies(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_replies_created_at ON inquiry_replies(created_at);

-- 创建回复表RLS策略
ALTER TABLE inquiry_replies ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有回复
CREATE POLICY "Admins can view all replies" ON inquiry_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- 管理员可以插入回复
CREATE POLICY "Admins can insert replies" ON inquiry_replies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    ); 