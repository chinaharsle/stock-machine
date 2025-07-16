# 🚀 Resend 邮件服务配置指南

## 📋 为什么选择 Resend？

- ✅ **Vercel 官方推荐**：完美集成，无地域限制
- ✅ **高送达率**：专业的邮件服务，优化的路由
- ✅ **免费额度**：每月 3,000 封邮件
- ✅ **简单配置**：开发者友好的设计
- ✅ **详细统计**：实时发送状态和分析

## 🔧 配置步骤

### 步骤1：注册 Resend 账户
1. 访问 [resend.com](https://resend.com)
2. 点击 "Sign up" 或使用 GitHub 账户快速注册
3. 验证邮箱地址

### 步骤2：创建 API Key
1. 登录 Resend Dashboard
2. 点击左侧导航栏中的 "API Keys"
3. 点击 "Create API Key" 按钮
4. 输入 API Key 名称（如：`harsle-production`）
5. 选择权限：`Sending access`
6. 点击 "Add" 创建
7. **重要：**复制生成的 API Key（格式：`re_xxxxxxxxx`）

### 步骤3：配置环境变量
编辑项目根目录的 `.env.local` 文件，添加以下配置：

```bash
# 📧 HARSLE 邮件配置 - Resend
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=onboarding@resend.dev
SMTP_FROM_NAME=HARSLE Stock Machine
NOTIFICATION_EMAIL=your-email@gmail.com
```

**重要：**
- 将 `re_xxxxxxxxxxxxxxxxxxxxxxxxxx` 替换为您在步骤2中复制的真实 API Key
- 将 `your-email@gmail.com` 替换为您希望接收询盘通知的邮箱地址

### 步骤4：域名验证（可选但推荐）
如果您有自己的域名，可以进行域名验证：

1. 在 Resend Dashboard 中点击 "Domains"
2. 点击 "Add Domain" 添加您的域名（如：`harsle.com`）
3. 按照提示添加 DNS 记录
4. 等待验证完成
5. 验证成功后，将 `SMTP_FROM` 更改为您的域名邮箱（如：`noreply@harsle.com`）

如果暂时没有域名，可以继续使用默认的 `onboarding@resend.dev`

## 🧪 测试配置

配置完成后，重启开发服务器并进行测试：

```bash
# 重启开发服务器
npm run dev

# 测试邮件发送（在新终端窗口中运行）
curl -X POST http://localhost:3000/api/debug-email \
  -H "Content-Type: application/json" \
  -d '{"action": "test-send"}'
```

## 📱 配置示例

### 使用默认域名（onboarding@resend.dev）
```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_AbCd1234567890XYZ123456789
SMTP_FROM=onboarding@resend.dev
SMTP_FROM_NAME=HARSLE Stock Machine
NOTIFICATION_EMAIL=admin@yourcompany.com
```

### 使用自定义域名（推荐）
```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_AbCd1234567890XYZ123456789
SMTP_FROM=noreply@harsle.com
SMTP_FROM_NAME=HARSLE Stock Machine
NOTIFICATION_EMAIL=admin@harsle.com
```

## 🚀 部署到 Vercel

如果您的应用部署在 Vercel 上，需要在 Vercel 项目设置中配置环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 Settings → Environment Variables
4. 添加上述所有环境变量
5. 重新部署应用

## 🛠 故障排除

### 常见问题：

1. **API Key 格式错误**
   - 确保 API Key 以 `re_` 开头
   - 完整复制，不要遗漏字符

2. **发件人邮箱被拒绝**
   - 如果使用自定义域名，确保域名已验证
   - 否则使用默认的 `onboarding@resend.dev`

3. **邮件发送失败**
   - 检查 API Key 是否正确
   - 确认账户没有超出免费额度
   - 查看 Resend Dashboard 的发送日志

### 获取帮助：
- Resend 文档：https://resend.com/docs
- 项目调试：访问 `/vercel-debug` 页面 