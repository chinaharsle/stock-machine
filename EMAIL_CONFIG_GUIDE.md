# 📧 邮箱环境变量配置指南

## 📋 概述

HARSLE Stock Machine系统需要配置SMTP邮件服务来发送询盘通知。以下是不同邮件服务商的配置方法。

## 🔧 环境变量列表

在项目根目录的 `.env.local` 文件中添加以下环境变量：

```bash
# SMTP 服务器配置
SMTP_HOST=你的SMTP服务器地址
SMTP_PORT=SMTP端口号
SMTP_USER=你的邮箱账号
SMTP_PASS=你的邮箱密码或授权码
SMTP_FROM=发件人邮箱地址
SMTP_FROM_NAME=发件人名称

# 通知邮箱
NOTIFICATION_EMAIL=接收询盘通知的邮箱地址
```

## 📮 常用邮件服务商配置

### 1. 🌟 Resend (推荐 - Vercel官方推荐)

```bash
# Resend 配置
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxx  # 你的Resend API Key
SMTP_FROM=noreply@yourdomain.com  # 必须是已验证的域名
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

**设置步骤：**
1. 访问 [resend.com](https://resend.com) 注册账户
2. 验证你的域名（如 yourdomain.com）
3. 创建API Key（格式：`re_xxxxxxxxx`）
4. 使用上述配置

**优势：**
- Vercel官方推荐，完美集成
- 优秀的送达率
- 免费额度：每月3000封邮件
- 现代化API设计

### 2. 📧 Gmail SMTP

```bash
# Gmail 配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # 应用专用密码，不是普通密码
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

**设置步骤：**
1. 登录Gmail，进入 [Google账户安全设置](https://myaccount.google.com/security)
2. 开启"两步验证"
3. 在"应用专用密码"中生成新密码
4. 使用生成的16位密码作为 `SMTP_PASS`

### 3. 🏢 腾讯企业邮箱

```bash
# 腾讯企业邮箱配置
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=587  # 或 465 (SSL)
SMTP_USER=your-email@yourcompany.com
SMTP_PASS=your-password
SMTP_FROM=your-email@yourcompany.com
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

### 4. ☁️ 阿里云邮箱

```bash
# 阿里云邮箱配置
SMTP_HOST=smtp.mxhichina.com
SMTP_PORT=587  # 或 465 (SSL)
SMTP_USER=your-email@yourcompany.com
SMTP_PASS=your-password
SMTP_FROM=your-email@yourcompany.com
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

### 5. 📬 SendGrid

```bash
# SendGrid 配置
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx  # 你的SendGrid API Key
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

### 6. 📪 QQ邮箱

```bash
# QQ邮箱配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-qq-number@qq.com
SMTP_PASS=your-authorization-code  # 授权码，不是QQ密码
SMTP_FROM=your-qq-number@qq.com
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

**获取QQ邮箱授权码：**
1. 登录QQ邮箱网页版
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
4. 生成授权码

### 7. 📮 163邮箱

```bash
# 163邮箱配置
SMTP_HOST=smtp.163.com
SMTP_PORT=587  # 或 465 (SSL)
SMTP_USER=your-email@163.com
SMTP_PASS=your-authorization-code  # 授权码
SMTP_FROM=your-email@163.com
SMTP_FROM_NAME=HARSLE Stock Machine

NOTIFICATION_EMAIL=admin@harsle.com
```

## 🚀 Vercel 部署配置

如果你的应用部署在Vercel上，需要在Vercel项目设置中配置环境变量：

1. 登录Vercel Dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加上述所有环境变量
5. 重新部署应用

## 🧪 测试邮件配置

配置完成后，你可以通过以下方式测试：

### 方法1：使用内置调试API

```bash
curl -X POST http://localhost:3000/api/debug-email \
  -H "Content-Type: application/json" \
  -d '{"action": "test-inquiry"}'
```

### 方法2：访问调试页面

访问 `http://localhost:3000/vercel-debug` 或 `https://yourdomain.com/vercel-debug`

## ⚠️ 常见问题

### 1. 连接被拒绝 (ECONNREFUSED)

**原因：** SMTP服务器地址或端口错误
**解决：** 检查 `SMTP_HOST` 和 `SMTP_PORT` 配置

### 2. 认证失败 (535 Authentication failed)

**原因：** 用户名或密码错误
**解决：** 
- 检查 `SMTP_USER` 和 `SMTP_PASS`
- 确保使用授权码而不是普通密码（Gmail、QQ等）

### 3. SSL/TLS 错误

**原因：** 加密协议配置问题
**解决：** 
- 尝试使用端口587（TLS）或465（SSL）
- 检查邮件服务商的官方文档

### 4. 发送频率限制

**原因：** 超出邮件服务商的发送限制
**解决：** 
- 等待一段时间后重试
- 考虑升级到付费邮件服务

## 🔐 安全建议

1. **不要在代码中硬编码密码**
2. **使用授权码而不是普通密码**
3. **定期更换API Key和授权码**
4. **在生产环境中使用专业的邮件服务**
5. **监控邮件发送日志**

## 📞 技术支持

如果遇到配置问题，可以：

1. 查看Vercel部署日志
2. 检查邮件服务商的官方文档
3. 使用调试API获取详细错误信息
4. 联系相应邮件服务商的技术支持

## 💡 推荐配置

对于生产环境，我们推荐使用：

1. **首选：Resend** - 为现代化Web应用设计
2. **备选：SendGrid** - 企业级邮件服务
3. **经济型：腾讯企业邮箱/阿里云邮箱** - 性价比高 