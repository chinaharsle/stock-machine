import { NextRequest, NextResponse } from 'next/server';
import { testEmailConfig, sendInquiryNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'test-config') {
      // 测试邮件配置
      const isConfigValid = await testEmailConfig();
      return NextResponse.json({
        success: isConfigValid,
        message: isConfigValid ? '邮件配置验证成功' : '邮件配置验证失败'
      });
    }

    if (action === 'send-test') {
      // 发送测试邮件
      const testInquiry = {
        fullName: '测试用户',
        email: 'test@example.com',
        phone: '+86 138 0000 0000',
        company: '测试公司',
        message: '这是一条测试询盘消息，用于验证邮件发送功能是否正常工作。',
        productModel: 'MasterBend 11025',
        ipAddress: '127.0.0.1',
        country: 'China'
      };

      const emailSent = await sendInquiryNotification(testInquiry);
      return NextResponse.json({
        success: emailSent,
        message: emailSent ? '测试邮件发送成功' : '测试邮件发送失败'
      });
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('邮件测试失败:', error);
    return NextResponse.json(
      { error: '邮件测试失败' },
      { status: 500 }
    );
  }
} 