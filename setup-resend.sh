#!/bin/bash

echo "🚀 HARSLE - Resend 邮件服务配置向导"
echo "=================================="
echo ""

echo "🌟 Resend 是 Vercel 官方推荐的邮件服务"
echo "✅ 免费额度：每月 3,000 封邮件"
echo "✅ 高送达率，专业可靠"
echo ""

# 检查是否已有配置
if [ -f .env.local ]; then
    echo "⚠️  检测到现有的 .env.local 文件"
    read -p "是否备份现有配置？(y/n): " backup_choice
    if [ "$backup_choice" = "y" ]; then
        cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ 已备份到 .env.local.backup.$(date +%Y%m%d_%H%M%S)"
    fi
fi

echo ""
echo "📋 请按以下步骤获取 Resend API Key："
echo "1. 访问 https://resend.com 注册账户"
echo "2. 登录后，点击左侧 'API Keys'"
echo "3. 点击 'Create API Key'"
echo "4. 输入名称（如：harsle-production），选择 'Sending access'"
echo "5. 复制生成的 API Key（格式：re_xxxxxxxxx）"
echo ""

read -p "请输入您的 Resend API Key: " resend_api_key

# 验证API Key格式
if [[ ! $resend_api_key =~ ^re_.+ ]]; then
    echo "❌ API Key 格式不正确，应该以 're_' 开头"
    echo "请重新运行脚本并输入正确的 API Key"
    exit 1
fi

echo ""
echo "📧 发件人邮箱配置："
echo "1. 使用默认域名 (onboarding@resend.dev) - 推荐新手"
echo "2. 使用自定义域名 (需要域名验证)"
echo ""

read -p "请选择 (1 或 2): " sender_choice

if [ "$sender_choice" = "2" ]; then
    echo ""
    echo "📋 自定义域名设置："
    echo "1. 在 Resend Dashboard 点击 'Domains'"
    echo "2. 添加您的域名并完成验证"
    echo "3. 输入验证后的域名邮箱"
    echo ""
    read -p "请输入您的自定义发件人邮箱: " sender_email
else
    sender_email="onboarding@resend.dev"
    echo "✅ 使用默认发件人邮箱: $sender_email"
fi

echo ""
read -p "请输入接收询盘通知的邮箱地址: " notification_email

# 验证邮箱格式
if [[ ! $notification_email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    echo "❌ 邮箱格式不正确"
    exit 1
fi

echo ""
echo "🔧 正在生成配置..."

# 生成 .env.local 文件
cat > .env.local << EOL
# 📧 HARSLE 邮件配置 - Resend
# 生成时间: $(date)

# Resend SMTP 配置
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=$resend_api_key
SMTP_FROM=$sender_email
SMTP_FROM_NAME=HARSLE Stock Machine

# 通知邮箱
NOTIFICATION_EMAIL=$notification_email

# 调试模式（开发环境）
# NODE_ENV=development
EOL

echo "✅ 配置文件已生成: .env.local"
echo ""

# 显示配置摘要
echo "📋 配置摘要："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SMTP 服务器: smtp.resend.com:587"
echo "API Key: ${resend_api_key:0:10}..."
echo "发件人邮箱: $sender_email"
echo "通知邮箱: $notification_email"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧪 测试配置"
echo "----------"
read -p "是否立即测试邮件发送？(y/n): " test_choice

if [ "$test_choice" = "y" ]; then
    echo ""
    echo "🚀 启动开发服务器进行测试..."
    echo "请在服务器启动后，在新终端窗口运行以下命令："
    echo ""
    echo "curl -X POST http://localhost:3000/api/debug-email \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"action\": \"test-send\"}'"
    echo ""
    echo "或者访问: http://localhost:3000/vercel-debug"
    echo ""
    
    # 检查是否需要安装依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装项目依赖..."
        npm install
    fi
    
    echo "🚀 启动开发服务器..."
    npm run dev
else
    echo ""
    echo "📝 手动测试步骤："
    echo "1. 运行: npm run dev"
    echo "2. 访问: http://localhost:3000/vercel-debug"
    echo "3. 点击 '测试邮件发送' 按钮"
    echo ""
    echo "或者运行命令："
    echo "curl -X POST http://localhost:3000/api/debug-email \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"action\": \"test-send\"}'"
fi

echo ""
echo "🎉 Resend 配置完成！"
echo ""
echo "📚 更多信息："
echo "- 配置指南: ./resend-config.md"
echo "- Resend 文档: https://resend.com/docs"
echo "- 项目调试页面: /vercel-debug"
echo ""
echo "如果遇到问题，请检查："
echo "1. API Key 是否正确（以 're_' 开头）"
echo "2. 发件人邮箱是否已验证（如使用自定义域名）"
echo "3. 账户是否超出免费额度" 