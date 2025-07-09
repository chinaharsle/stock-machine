# 数据库更新说明

## 概述
为了支持询盘的IP地址和国家信息显示，需要在数据库中添加两个新字段。

## 需要添加的字段

### 1. ip_address 字段
- 类型: VARCHAR(45)
- 用途: 存储客户提交询盘时的IP地址
- 支持IPv4和IPv6格式

### 2. country 字段
- 类型: VARCHAR(100)
- 用途: 存储基于IP地址识别的来源国家

## 手动更新步骤

### 方法1: 通过Supabase控制台
1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "SQL Editor"
4. 执行以下SQL命令：

```sql
-- 添加IP地址字段
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- 添加国家字段
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_inquiries_ip_address ON public.inquiries(ip_address);
CREATE INDEX IF NOT EXISTS idx_inquiries_country ON public.inquiries(country);

-- 添加字段注释
COMMENT ON COLUMN public.inquiries.ip_address IS 'IP地址 - 支持IPv4和IPv6格式';
COMMENT ON COLUMN public.inquiries.country IS '来源国家 - 基于IP地址识别';
```

### 方法2: 使用提供的SQL文件
1. 在项目根目录找到 `sql/add-ip-country-fields.sql` 文件
2. 复制文件内容到Supabase SQL Editor
3. 执行SQL命令

## 验证更新

### 检查字段是否添加成功
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inquiries' 
AND column_name IN ('ip_address', 'country');
```

### 测试数据插入
```sql
-- 插入测试数据
INSERT INTO public.inquiries (
    full_name, email, phone, message, 
    ip_address, country, status
) VALUES (
    'Test User', 'test@example.com', '+1234567890', 
    'Test message', '192.168.1.100', 'China', 'pending'
);

-- 查询测试数据
SELECT id, full_name, email, ip_address, country, created_at 
FROM public.inquiries 
WHERE full_name = 'Test User';

-- 删除测试数据
DELETE FROM public.inquiries WHERE full_name = 'Test User';
```

## 更新完成后的效果

更新完成后，系统将能够：

1. **保存IP地址和国家信息**: 新提交的询盘将包含客户的IP地址和来源国家
2. **后台显示地理信息**: 在询盘详情页面中显示IP地址和来源国家
3. **提高询盘分析能力**: 管理员可以了解询盘的地理分布情况

## 注意事项

- 现有的询盘记录的ip_address和country字段将为空(NULL)，这是正常现象
- 系统已经设计为兼容模式，即使没有这些字段也能正常工作
- 添加字段后，新的询盘提交将自动包含地理信息

## 故障排除

如果遇到问题：

1. **权限错误**: 确保你有数据库的ALTER权限
2. **字段已存在**: 使用 `IF NOT EXISTS` 可以避免重复添加
3. **查询失败**: 检查表名和字段名是否正确

更新完成后，请重新测试询盘提交功能以确保一切正常工作。 