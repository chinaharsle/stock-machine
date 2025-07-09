#!/bin/bash

echo "📧 邮件功能测试"
echo "=============="
echo ""

echo "🔧 1. 测试邮件配置连接..."
config_result=$(curl -s -X POST http://localhost:3000/api/test-email -H "Content-Type: application/json" -d '{"action": "test-config"}')
echo "结果: $config_result"
echo ""

if echo "$config_result" | grep -q '"success":true'; then
    echo "✅ 邮件配置验证成功！"
    echo ""
    echo "📤 2. 发送测试邮件..."
    send_result=$(curl -s -X POST http://localhost:3000/api/test-email -H "Content-Type: application/json" -d '{"action": "send-test"}')
    echo "结果: $send_result"
    echo ""
    
    if echo "$send_result" | grep -q '"success":true'; then
        echo "✅ 测试邮件发送成功！请检查您的邮箱。"
    else
        echo "❌ 测试邮件发送失败。请检查配置。"
    fi
else
    echo "❌ 邮件配置验证失败。"
    echo ""
    echo "🔧 解决方案："
    echo "1. 请先配置 .env.local 文件中的邮件设置"
    echo "2. 运行 ./setup-email-config.sh 进行配置"
    echo "3. 确保邮件服务器设置正确"
fi

echo ""
echo "📚 更多帮助："
echo "- 查看 .env.local.example 文件获取配置示例"
echo "- 运行 ./setup-email-config.sh 使用配置向导"
