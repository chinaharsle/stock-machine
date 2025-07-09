# 🚀 Resend 邮件服务配置指南

## 📋 配置步骤

### 1. 注册 Resend 账户
1. 访问 [resend.com](https://resend.com)
2. 点击 "Sign up" 或使用 GitHub 账户快速注册
3. 验证邮箱地址

### 2. 创建 API Key
1. 登录 Resend Dashboard
2. 点击左侧导航栏中的 "API Keys"
3. 点击 "Create API Key" 按钮
4. 输入 API Key 名称（如：`harsle-production`）
5. 选择权限：`Sending access`
6. 点击 "Add" 创建
7. **重要：**复制生成的 API Key（格式：`re_xxxxxxxxx`）

### 3. 配置 Vercel 环境变量
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings" 标签
4. 点击 "Environment Variables"
5. 添加以下环境变量：

```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
```

**重要：**将 `your-resend-api-key` 替换为步骤2中复制的实际 API Key

### 4. 域名验证（可选但推荐）
1. 在 Resend Dashboard 中点击 "Domains"
2. 点击 "Add Domain" 添加你的域名（如：`harsle.com`）
3. 按照提示添加 DNS 记录
4. 等待验证完成

### 5. 重新部署应用
配置完成后，需要重新部署应用以应用新的环境变量：

```bash
git commit --allow-empty -m "Trigger Vercel deployment for Resend config"
git push origin main
```

## 🔧 测试配置

### 方法1：使用调试工具
1. 部署完成后，访问：`https://your-domain.com/vercel-debug`
2. 点击 "测试Resend配置" 按钮
3. 查看测试结果

### 方法2：发送测试邮件
在首页询盘表单中提交一个测试询盘，查看是否能收到邮件。

## 📊 Resend 优势

- ✅ **Vercel 官方推荐**：完美集成，无地域限制
- ✅ **高送达率**：专业的邮件服务，优化的路由
- ✅ **免费额度**：每月 3,000 封邮件
- ✅ **现代化 API**：开发者友好的设计
- ✅ **详细统计**：实时发送状态和分析
- ✅ **DKIM 支持**：提高邮件可信度

## 🛠 故障排除

### 常见问题

1. **API Key 错误**
   - 确保 API Key 以 `re_` 开头
   - 检查 API Key 是否有发送权限

2. **邮件被拒收**
   - 验证你的域名
   - 检查 SPF、DKIM 记录

3. **连接超时**
   - 确保 Vercel 环境变量正确设置
   - 检查网络连接

### 查看日志
- 在 Vercel Dashboard 中查看 Function 日志
- 使用 `/vercel-debug` 页面进行实时诊断

## 📞 支持

如果遇到问题，可以：
1. 查看 [Resend 文档](https://resend.com/docs)
2. 使用项目中的 `/vercel-debug` 调试工具
3. 检查 Vercel 部署日志

## 🎯 下一步

配置完成后，建议：
1. 测试邮件发送功能
2. 监控邮件送达率
3. 根据需要调整邮件模板
4. 考虑添加更多邮件功能（如自动回复） 