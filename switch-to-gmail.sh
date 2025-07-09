#!/bin/bash

echo "🔧 快速切换到Gmail配置"
echo "======================"
echo ""
echo "请提供以下信息来配置Gmail："
echo ""

read -p "Gmail地址: " gmail_user
read -s -p "Gmail应用专用密码: " gmail_pass
echo ""
read -p "通知接收邮箱: " notification_email

echo ""
echo "正在备份当前配置..."
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

echo ""
echo "正在更新邮件配置为Gmail..."

# 创建新的Gmail配置
cat > .env.local.gmail << EOL
# 原有配置保持不变...
$(grep -v "^SMTP_" .env.local | grep -v "^NOTIFICATION_EMAIL")

# Gmail邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$gmail_user
SMTP_PASS=$gmail_pass
SMTP_FROM=$gmail_user
SMTP_FROM_NAME=HARSLE Stock Machine
NOTIFICATION_EMAIL=$notification_email
EOL

# 替换原文件
mv .env.local.gmail .env.local

echo ""
echo "✅ Gmail配置完成！"
echo ""
echo "🧪 测试Gmail配置："
echo "curl -X POST http://localhost:3000/api/test-email -H 'Content-Type: application/json' -d '{\"action\": \"test-config\"}'"
echo ""
echo "📧 发送测试邮件："
echo "curl -X POST http://localhost:3000/api/test-email -H 'Content-Type: application/json' -d '{\"action\": \"send-test\"}'"
echo ""
echo "🔄 要恢复阿里云配置，请运行："
echo "cp .env.local.backup.* .env.local"
