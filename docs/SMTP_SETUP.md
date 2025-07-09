# Supabase SMTP 邮件配置指南

## 概述
本指南将帮助您配置Supabase自定义SMTP来发送询盘邮件，无需使用SendGrid。

## 前提条件
- 已在Supabase Dashboard中配置了自定义SMTP设置
- 有效的SMTP服务器（如腾讯企业邮箱、阿里云邮箱、Gmail等）

## 配置步骤

### 1. Supabase Dashboard SMTP 设置
1. 登录 Supabase Dashboard
2. 进入项目设置 → Authentication → SMTP Settings
3. 配置以下信息：
   - SMTP Host: 您的SMTP服务器地址
   - SMTP Port: 通常为465 (SSL) 或587 (TLS)
   - SMTP User: 您的邮箱账号
   - SMTP Pass: 您的邮箱密码或授权码
   - SMTP From: 发件人邮箱

### 2. 使用不同的SMTP服务商

#### 腾讯企业邮箱
```
SMTP Host: smtp.exmail.qq.com
SMTP Port: 465
启用SSL: 是
```

#### 阿里云邮箱
```
SMTP Host: smtp.mxhichina.com
SMTP Port: 465
启用SSL: 是
```

#### Gmail
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
启用TLS: 是
```

#### 163邮箱
```
SMTP Host: smtp.163.com
SMTP Port: 465
启用SSL: 是
```

### 3. 修改Edge Function使用Supabase内置邮件服务

由于Supabase的自定义SMTP主要用于身份验证邮件，我们需要使用替代方案：

#### 方案1：使用Supabase Functions发送邮件
创建一个新的Edge Function来直接使用SMTP发送邮件：

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

serve(async (req) => {
  const { inquiryData } = await req.json()
  
  const client = new SmtpClient()
  
  await client.connectTLS({
    hostname: Deno.env.get('SMTP_HOST')!,
    port: parseInt(Deno.env.get('SMTP_PORT')!) || 465,
    username: Deno.env.get('SMTP_USER')!,
    password: Deno.env.get('SMTP_PASS')!,
  })
  
  await client.send({
    from: Deno.env.get('SMTP_FROM')!,
    to: Deno.env.get('INQUIRY_EMAIL_TO')!,
    subject: `新询盘 - ${inquiryData.fullName}`,
    html: emailContent,
  })
  
  await client.close()
  
  return new Response(JSON.stringify({ success: true }))
})
```

#### 方案2：使用Webhook通知
配置Webhook来接收询盘通知，发送到您的邮箱或即时通讯工具。

### 4. 环境变量配置
在Supabase Dashboard的Edge Functions设置中添加以下环境变量：

```
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
INQUIRY_EMAIL_TO=admin@company.com
```

### 5. 部署和测试

1. 部署Edge Function：
```bash
supabase functions deploy send-inquiry-email
```

2. 测试邮件发送：
```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/send-inquiry-email' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "inquiryData": {
      "fullName": "测试用户",
      "email": "test@example.com",
      "phone": "123456789",
      "message": "这是一条测试询盘"
    }
  }'
```

## 推荐解决方案

### 使用免费的邮件服务
由于您已配置了Supabase自定义SMTP，建议使用以下免费解决方案：

1. **使用企业邮箱**：配置腾讯企业邮箱或阿里云邮箱
2. **使用个人邮箱**：Gmail、163邮箱等（需要开启SMTP授权）
3. **使用通知服务**：配置微信、钉钉等即时通讯工具接收通知

### 简化实现
最简单的方案是直接在前端提交询盘时：
1. 保存询盘到Supabase数据库
2. 使用浏览器的`mailto:`链接提示管理员查看新询盘
3. 管理员定期检查后台询盘列表

这种方案无需配置复杂的邮件服务，且更加可靠。

## 故障排除

### 常见问题
1. **SMTP连接失败**：检查服务器地址、端口和认证信息
2. **邮件发送失败**：确认发件人邮箱配置正确
3. **邮件被拒绝**：检查SMTP服务商的发送限制

### 日志查看
在Supabase Dashboard的Edge Functions日志中查看详细错误信息。

## 安全考虑
- 使用强密码或授权码
- 定期更新SMTP凭据
- 监控邮件发送量，避免被标记为垃圾邮件 