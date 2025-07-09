# 🔧 阿里云企业邮箱问题排查指南

## 当前问题状态
- ✅ 网络连接正常
- ✅ SMTP服务器可达
- ❌ 认证失败 (526 Authentication failure)

## 🔍 排查步骤

### 1. 检查邮箱账户状态
登录阿里云企业邮箱管理后台：
- [ ] 确认 `notification@harsle.com` 邮箱已创建
- [ ] 确认邮箱状态为"正常"（非暂停/禁用）
- [ ] 确认邮箱已激活（首次使用需要激活）

### 2. 检查SMTP服务设置
在邮箱管理后台：
- [ ] 进入"邮箱设置" → "客户端设置"
- [ ] 确认SMTP服务已开启
- [ ] 查看是否需要生成"授权码"或"应用密码"

### 3. 密码验证
确认使用的密码：
- [ ] 不是阿里云账户登录密码
- [ ] 是邮箱的SMTP专用密码或授权码
- [ ] 如果有授权码功能，使用授权码而非普通密码

### 4. 检查安全限制
- [ ] 查看是否有IP白名单限制
- [ ] 确认服务器IP是否被允许
- [ ] 检查是否有地理位置限制

## 🚀 快速解决方案

### 方案A：生成SMTP授权码
1. 登录阿里云企业邮箱管理后台
2. 找到 "邮箱设置" → "安全设置" → "应用密码"
3. 生成新的SMTP应用密码
4. 更新 .env.local 中的 SMTP_PASS

### 方案B：临时使用Gmail
如果阿里云问题暂时无法解决，可以：
1. 运行: `./switch-to-gmail.sh`
2. 配置Gmail应用专用密码
3. 先确保邮件功能正常工作

### 方案C：联系邮箱管理员
如果以上都不行：
1. 联系阿里云企业邮箱技术支持
2. 提供错误信息: "526 Authentication failure"
3. 确认 notification@harsle.com 账户设置

## 📞 联系信息
- 阿里云企业邮箱技术支持
- 或联系您的IT管理员检查邮箱设置

## 🧪 测试命令
```bash
# 测试当前配置
curl -X POST http://localhost:3000/api/debug-email -H "Content-Type: application/json" -d '{"action": "test-connection"}'

# 测试不同认证方式
curl -X POST http://localhost:3000/api/test-aliyun-auth -H "Content-Type: application/json" -d '{}'
```
