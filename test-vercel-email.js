/**
 * Vercel邮件调试测试脚本
 * 运行命令: node test-vercel-email.js
 */

const fetch = require('node-fetch');

// 测试配置
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

console.log(`🔧 测试目标URL: ${BASE_URL}`);

// 测试函数
const runTest = async (action, description) => {
  console.log(`\n🧪 ${description}`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/vercel-debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 测试通过');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ 测试失败');
      console.log('错误信息:', data.message);
      if (data.error) {
        console.log('详细错误:', data.error);
      }
      if (data.troubleshooting) {
        console.log('\n🔍 故障排除建议:');
        data.troubleshooting.commonIssues?.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue}`);
        });
        console.log('\n🛠️ 解决步骤:');
        data.troubleshooting.nextSteps?.forEach((step, index) => {
          console.log(`${index + 1}. ${step}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }
};

// 主测试流程
const main = async () => {
  console.log('🚀 Vercel邮件功能调试测试');
  console.log('时间:', new Date().toLocaleString());
  
  // 测试1: 检查环境变量
  await runTest('check-env', '检查环境变量配置');
  
  // 测试2: 测试SMTP连接
  await runTest('test-vercel-connection', '测试SMTP服务器连接');
  
  // 测试3: 发送测试邮件
  await runTest('test-vercel-send', '发送测试邮件');
  
  // 测试4: 获取备用方案
  await runTest('test-alternatives', '获取备用邮件服务方案');
  
  console.log('\n🎉 所有测试完成!');
  console.log('\n📋 总结建议:');
  console.log('1. 如果SMTP连接失败，考虑使用Gmail或SendGrid');
  console.log('2. 确保所有环境变量在Vercel中正确设置');
  console.log('3. 检查邮件服务商的海外IP访问策略');
  console.log('4. 查看Vercel Function日志获取详细错误信息');
};

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

// 运行测试
main().catch((error) => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}); 