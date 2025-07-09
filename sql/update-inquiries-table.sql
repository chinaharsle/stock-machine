-- 更新inquiries表结构
-- 添加缺少的字段并修正字段名称

-- 添加 ip_address 和 country 字段（如果不存在）
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 将 company_name 字段重命名为 company（如果需要）
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inquiries' 
        AND column_name = 'company_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.inquiries RENAME COLUMN company_name TO company;
    END IF;
END $$;

-- 如果 company 字段不存在，则添加它
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_product_model ON public.inquiries(product_model);
CREATE INDEX IF NOT EXISTS idx_inquiries_ip_address ON public.inquiries(ip_address);
CREATE INDEX IF NOT EXISTS idx_inquiries_country ON public.inquiries(country);

-- 确保 RLS 策略正确配置
-- 允许匿名用户插入询盘
DROP POLICY IF EXISTS inquiries_insert_policy ON public.inquiries;
CREATE POLICY inquiries_insert_policy ON public.inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (TRUE);

-- 只有管理员可以查看询盘
DROP POLICY IF EXISTS inquiries_select_policy ON public.inquiries;
CREATE POLICY inquiries_select_policy ON public.inquiries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- 只有管理员可以更新询盘
DROP POLICY IF EXISTS inquiries_update_policy ON public.inquiries;
CREATE POLICY inquiries_update_policy ON public.inquiries
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- 只有管理员可以删除询盘
DROP POLICY IF EXISTS inquiries_delete_policy ON public.inquiries;
CREATE POLICY inquiries_delete_policy ON public.inquiries
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_admin = TRUE
        )
    );

-- 显示表结构确认
\d public.inquiries; 