import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendInquiryNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { action, testProductModel } = await request.json();

    if (action === 'debug-config') {
      // 显示当前环境变量配置（隐藏密码）
      const config = {
        SMTP_HOST: process.env.SMTP_HOST || '未配置',
        SMTP_PORT: process.env.SMTP_PORT || '未配置',
        SMTP_USER: process.env.SMTP_USER || '未配置',
        SMTP_PASS: process.env.SMTP_PASS ? '已配置' : '未配置',
        SMTP_FROM: process.env.SMTP_FROM || '未配置',
        SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || '未配置',
        NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL || '未配置'
      };

      return NextResponse.json({
        success: true,
        message: '邮件配置信息',
        config
      });
    }

    if (action === 'test-connection') {
      // 详细测试邮件连接
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!host || !user || !pass) {
        return NextResponse.json({
          success: false,
          message: '邮件配置不完整',
          missing: {
            host: !host,
            user: !user,
            pass: !pass
          }
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: host,
          port: port,
          secure: port === 465,
          auth: {
            user: user,
            pass: pass
          },
          // 调试选项
          debug: true,
          logger: true,
          // 阿里云邮箱特殊配置
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000
        });

        console.log('开始验证邮件配置...');
        await transporter.verify();
        console.log('邮件配置验证成功！');

        return NextResponse.json({
          success: true,
          message: '邮件服务器连接成功',
          details: {
            host,
            port,
            user,
            secure: port === 465
          }
        });
      } catch (error: unknown) {
        console.error('邮件连接失败详细信息:', error);
        
        return NextResponse.json({
          success: false,
          message: '邮件服务器连接失败',
          error: error instanceof Error ? error.message : String(error),
          code: error instanceof Error && 'code' in error ? error.code : undefined,
          details: {
            host,
            port,
            user,
            secure: port === 465
          }
        });
      }
    }

    if (action === 'test-send') {
      // 发送测试邮件
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const from = process.env.SMTP_FROM || user;
      const fromName = process.env.SMTP_FROM_NAME || 'HARSLE Test';
      const to = process.env.NOTIFICATION_EMAIL || user;

      try {
        const transporter = nodemailer.createTransport({
          host: host,
          port: port,
          secure: port === 465,
          auth: {
            user: user,
            pass: pass
          },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000
        });

        const mailOptions = {
          from: {
            name: fromName,
            address: from!
          },
          to: to!,
          subject: '🔧 HARSLE 邮件功能测试',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">🔧 邮件功能测试</h2>
              <p>这是一封测试邮件，确认HARSLE邮件功能正常工作。</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>配置信息:</h3>
                <ul>
                  <li>SMTP服务器: ${host}</li>
                  <li>端口: ${port}</li>
                  <li>发送者: ${from}</li>
                  <li>接收者: ${to}</li>
                  <li>时间: ${new Date().toLocaleString('zh-CN')}</li>
                </ul>
              </div>
              <p style="color: #059669;">✅ 如果您收到这封邮件，说明邮件功能已正常工作！</p>
            </div>
          `,
          text: `
HARSLE 邮件功能测试

这是一封测试邮件，确认邮件功能正常工作。

配置信息:
- SMTP服务器: ${host}
- 端口: ${port}
- 发送者: ${from}
- 接收者: ${to}
- 时间: ${new Date().toLocaleString('zh-CN')}

如果您收到这封邮件，说明邮件功能已正常工作！
          `
        };

        const info = await transporter.sendMail(mailOptions);
        
        return NextResponse.json({
          success: true,
          message: '测试邮件发送成功',
          messageId: info.messageId || '',
          accepted: info.accepted || [],
          rejected: info.rejected || []
        });
      } catch (error: unknown) {
        console.error('测试邮件发送失败:', error);
        
        return NextResponse.json({
          success: false,
          message: '测试邮件发送失败',
          error: error instanceof Error ? error.message : String(error),
          code: error instanceof Error && 'code' in error ? error.code : undefined
        });
      }
    }

    if (action === 'test-inquiry') {
      // 测试询盘邮件发送功能
      try {
        const testInquiry = {
          fullName: '测试用户',
          email: 'test@example.com',
          phone: '+1234567890',
          company: '测试公司',
          message: '这是一封测试询盘邮件，包含产品参数信息。',
          productModel: testProductModel || 'MasterBend 11025',
          ipAddress: '192.168.1.100',
          country: 'China'
        };

        const success = await sendInquiryNotification(testInquiry);
        
        return NextResponse.json({
          success,
          message: success ? '询盘邮件发送成功' : '询盘邮件发送失败',
          testData: testInquiry
        });
      } catch (error: unknown) {
        console.error('询盘邮件发送失败:', error);
        
        return NextResponse.json({
          success: false,
          message: '询盘邮件发送失败',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error: unknown) {
    console.error('调试API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 