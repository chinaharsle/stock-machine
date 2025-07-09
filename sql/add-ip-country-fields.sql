-- 添加IP地址和国家字段到inquiries表
-- 这些字段将用于记录询盘来源的地理信息

-- 添加 ip_address 字段
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- 添加 country 字段
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_inquiries_ip_address ON public.inquiries(ip_address);
CREATE INDEX IF NOT EXISTS idx_inquiries_country ON public.inquiries(country);

-- 添加字段注释
COMMENT ON COLUMN public.inquiries.ip_address IS 'IP地址 - 支持IPv4和IPv6格式';
COMMENT ON COLUMN public.inquiries.country IS '来源国家 - 基于IP地址识别'; 