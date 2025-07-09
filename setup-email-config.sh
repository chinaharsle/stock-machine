#!/bin/bash

echo "🔧 HARSLE 邮件配置向导"
echo "===================="
echo ""

echo "请选择您的邮件服务商："
echo "1. Gmail (推荐)"
echo "2. 腾讯企业邮箱"
echo "3. 阿里云邮箱"
echo "4. 163邮箱"
echo "5. QQ邮箱"
echo "6. 其他 (手动配置)"
echo ""

read -p "请输入选择 (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📧 Gmail 配置"
        echo "============"
        echo ""
        echo "⚠️  重要提醒：Gmail 需要使用应用专用密码"
        echo "1. 访问 https://myaccount.google.com/security"
        echo "2. 开启 '两步验证'"
        echo "3. 生成 '应用专用密码'"
        echo ""
        
        read -p "请输入您的Gmail地址: " gmail_user
        read -s -p "请输入Gmail应用专用密码: " gmail_pass
        echo ""
        read -p "请输入通知邮箱地址: " notification_email
        
        echo ""
        echo "正在配置 .env.local 文件..."
        
        # 备份现有的 .env.local
        if [ -f .env.local ]; then
            cp .env.local .env.local.backup
        fi
        
        # 添加或更新邮件配置
        cat >> .env.local << EOL

# 邮件配置 (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$gmail_user
SMTP_PASS=$gmail_pass
SMTP_FROM=$gmail_user
SMTP_FROM_NAME=HARSLE Stock Machine
NOTIFICATION_EMAIL=$notification_email
EOL
        
        echo "✅ Gmail 配置完成！"
        ;;
    2)
        echo ""
        echo "📧 腾讯企业邮箱配置"
        echo "================"
        
        read -p "请输入您的企业邮箱地址: " tencent_user
        read -s -p "请输入邮箱密码: " tencent_pass
        echo ""
        read -p "请输入通知邮箱地址: " notification_email
        
        if [ -f .env.local ]; then
            cp .env.local .env.local.backup
        fi
        
        cat >> .env.local << EOL

# 邮件配置 (腾讯企业邮箱)
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=587
SMTP_USER=$tencent_user
SMTP_PASS=$tencent_pass
SMTP_FROM=$tencent_user
SMTP_FROM_NAME=HARSLE Stock Machine
NOTIFICATION_EMAIL=$notification_email
EOL
        
        echo "✅ 腾讯企业邮箱配置完成！"
        ;;
    *)
        echo ""
        echo "📝 手动配置指南"
        echo "=============="
        echo ""
        echo "请在 .env.local 文件中添加以下配置："
        echo ""
        echo "# 邮件配置"
        echo "SMTP_HOST=your-smtp-host"
        echo "SMTP_PORT=587"
        echo "SMTP_USER=your-email@domain.com"
        echo "SMTP_PASS=your-password"
        echo "SMTP_FROM=your-email@domain.com"
        echo "SMTP_FROM_NAME=HARSLE Stock Machine"
        echo "NOTIFICATION_EMAIL=admin@harsle.com"
        echo ""
        ;;
esac

echo ""
echo "🧪 测试邮件配置"
echo "=============="
echo ""
echo "运行以下命令测试邮件配置："
echo ""
echo "1. 测试邮件服务器连接:"
echo "   curl -X POST http://localhost:3000/api/test-email -H 'Content-Type: application/json' -d '{\"action\": \"test-config\"}'"
echo ""
echo "2. 发送测试邮件:"
echo "   curl -X POST http://localhost:3000/api/test-email -H 'Content-Type: application/json' -d '{\"action\": \"send-test\"}'"
echo ""
echo "📚 更多帮助"
echo "=========="
echo "查看 .env.local.example 文件获取完整的配置示例"
echo ""
