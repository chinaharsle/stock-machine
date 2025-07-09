#!/bin/bash

echo "🔧 测试阿里云企业邮箱不同配置"
echo "================================"

configs=(
    '{"host":"smtp.qiye.aliyun.com","port":465,"secure":true}'
    '{"host":"smtp.qiye.aliyun.com","port":587,"secure":false}'
    '{"host":"smtp.mxhichina.com","port":465,"secure":true}'
    '{"host":"smtp.mxhichina.com","port":587,"secure":false}'
)

for i in "${!configs[@]}"; do
    config=${configs[$i]}
    echo ""
    echo "测试配置 $((i+1)): $config"
    
    # 这里需要手动测试，因为我们不能直接修改环境变量
    echo "请在 .env.local 中尝试以下配置："
    
    host=$(echo $config | jq -r '.host')
    port=$(echo $config | jq -r '.port')
    secure=$(echo $config | jq -r '.secure')
    
    echo "SMTP_HOST=$host"
    echo "SMTP_PORT=$port"
    if [ "$secure" = "true" ]; then
        echo "# 使用SSL加密 (端口465)"
    else
        echo "# 使用STARTTLS (端口587)"
    fi
    echo ""
done

echo "🔍 阿里云企业邮箱常见问题解决："
echo "1. 确保在阿里云企业邮箱管理后台开启了SMTP服务"
echo "2. 检查是否需要生成应用专用密码"
echo "3. 确认邮箱密码正确（不是登录密码而是SMTP密码）"
echo "4. 检查企业邮箱是否有IP限制"
