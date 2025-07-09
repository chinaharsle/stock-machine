# 邮件通知设置指南

## 概述
当客户在网站上提交询盘时，系统会自动发送邮件通知到指定的邮箱。这个功能通过Supabase Edge Functions实现。

## 设置步骤

### 1. 获取SendGrid API Key
1. 注册/登录 [SendGrid](https://sendgrid.com/)
2. 进入设置 → API Keys
3. 创建新的API Key，选择"Full Access"权限
4. 复制生成的API Key

### 2. 配置Supabase环境变量
在Supabase Dashboard中设置以下环境变量：

1. 进入项目设置 → Settings → Edge Functions
2. 添加以下环境变量：

```
SENDGRID_API_KEY=你的SendGrid API Key
INQUIRY_EMAIL_TO=接收询盘的邮箱地址 (例如: info@harsle.com)
INQUIRY_EMAIL_FROM=发送邮件的邮箱地址 (例如: noreply@harsle.com)
```

### 3. 部署Edge Function
使用Supabase CLI部署Edge Function：

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录Supabase
supabase login

# 部署函数
supabase functions deploy send-inquiry-email
```

### 4. 测试邮件功能
部署完成后，可以通过以下方式测试：

1. 在网站上提交一个测试询盘
2. 检查指定邮箱是否收到通知邮件
3. 检查Supabase函数日志查看是否有错误

## 邮件内容
邮件将包含以下信息：
- 客户基本信息（姓名、邮箱、WhatsApp、公司）
- 客户IP地址和来源国家
- 询盘的产品型号
- 询盘消息内容
- 提交时间

## 替代邮件服务

如果不想使用SendGrid，可以修改Edge Function来使用其他邮件服务：

### 使用Mailgun
1. 注册Mailgun账户
2. 获取API Key和域名
3. 修改`send-inquiry-email/index.ts`中的`sendEmailNotification`函数

### 使用SMTP
1. 获取SMTP服务器配置
2. 使用Deno的SMTP库发送邮件
3. 修改相应的环境变量

## 数据库配置

确保已经运行以下SQL脚本创建必要的数据库表：

```sql
-- 运行 sql/create-inquiries-table.sql
```

## 故障排除

### 常见问题：
1. **邮件发送失败**
   - 检查SendGrid API Key是否正确
   - 确认发送邮箱地址已验证
   - 检查Edge Function日志

2. **数据库错误**
   - 确保inquiries表已创建
   - 检查RLS策略配置
   - 确认Service Role Key权限

3. **函数部署失败**
   - 检查Supabase CLI是否最新版本
   - 确认已正确登录Supabase
   - 检查函数代码语法

### 查看日志
```bash
# 查看函数日志
supabase functions logs send-inquiry-email
```

## 安全考虑
1. 定期轮换API Key
2. 限制邮件发送频率防止滥用
3. 验证输入数据防止XSS攻击
4. 监控邮件发送量和成本 