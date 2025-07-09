import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendInquiryNotification } from '@/lib/email';

// 定义错误类型
interface NodemailerError extends Error {
  code?: string;
  command?: string;
  responseCode?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'check-env') {
      // 检查Vercel环境变量
      const envCheck = {
        SMTP_HOST: process.env.SMTP_HOST || '❌ 未设置',
        SMTP_PORT: process.env.SMTP_PORT || '❌ 未设置',
        SMTP_USER: process.env.SMTP_USER || '❌ 未设置',
        SMTP_PASS: process.env.SMTP_PASS ? '✅ 已设置' : '❌ 未设置',
        SMTP_FROM: process.env.SMTP_FROM || '❌ 未设置',
        SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || '❌ 未设置',
        NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL || '❌ 未设置',
        // Vercel特定环境变量
        VERCEL: process.env.VERCEL || '❌ 未在Vercel环境',
        VERCEL_ENV: process.env.VERCEL_ENV || '❌ 未知环境',
        VERCEL_REGION: process.env.VERCEL_REGION || '❌ 未知区域',
        NODE_ENV: process.env.NODE_ENV || '❌ 未知环境'
      };

      return NextResponse.json({
        success: true,
        message: 'Vercel环境变量检查',
        environment: envCheck,
        isProduction: process.env.VERCEL_ENV === 'production',
        isVercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString(),
        recommendations: [
          '确保所有邮件相关环境变量都已在Vercel项目设置中配置',
          '检查环境变量值是否包含特殊字符或空格',
          '确认环境变量在正确的环境(Production/Preview)中设置'
        ]
      });
    }

    if (action === 'test-vercel-connection') {
      console.log('🔍 [Vercel] 开始测试邮件连接...');
      
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!host || !user || !pass) {
        return NextResponse.json({
          success: false,
          message: 'Vercel环境变量配置不完整',
          missing: {
            host: !host,
            user: !user,
            pass: !pass
          },
          solution: '请在Vercel项目设置的Environment Variables中添加缺失的变量'
        });
      }

      try {
        // 为Vercel环境优化的配置
        const transporter = nodemailer.createTransport({
          host: host,
          port: port,
          secure: port === 465,
          auth: {
            user: user,
            pass: pass
          },
          // Vercel环境特殊配置
          connectionTimeout: 30000,    // 30秒超时
          greetingTimeout: 15000,      // 15秒握手超时
          socketTimeout: 30000,        // 30秒socket超时
          debug: true,                 // 启用调试
          logger: true,                // 启用日志
          // 处理代理和网络问题
          requireTLS: true,            // 强制TLS
          tls: {
            rejectUnauthorized: false  // 允许自签名证书
          }
        });

        console.log('🔗 [Vercel] 尝试连接SMTP服务器...');
        const start = Date.now();
        await transporter.verify();
        const duration = Date.now() - start;
        console.log(`✅ [Vercel] SMTP连接成功，耗时: ${duration}ms`);

        return NextResponse.json({
          success: true,
          message: 'Vercel环境SMTP连接成功',
          details: {
            host,
            port,
            user,
            secure: port === 465,
            connectionTime: `${duration}ms`,
            vercelRegion: process.env.VERCEL_REGION,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        const nodemailerError = error as NodemailerError;
        console.error('❌ [Vercel] SMTP连接失败:', nodemailerError);
        
        // 分析错误类型
        let errorType = 'unknown';
        let solution = '';
        
        if (nodemailerError.code === 'ECONNREFUSED') {
          errorType = 'connection_refused';
          solution = '无法连接到SMTP服务器，可能是网络问题或服务器地址错误';
        } else if (nodemailerError.code === 'ENOTFOUND') {
          errorType = 'dns_error';
          solution = 'DNS解析失败，请检查SMTP服务器地址';
        } else if (nodemailerError.code === 'ETIMEDOUT') {
          errorType = 'timeout';
          solution = '连接超时，可能是网络延迟或防火墙阻止';
        } else if (nodemailerError.responseCode === 535) {
          errorType = 'auth_failed';
          solution = '认证失败，请检查用户名和密码';
        } else if (nodemailerError.message.includes('Certificate')) {
          errorType = 'certificate_error';
          solution = 'SSL证书问题，可能需要配置TLS选项';
        }

        return NextResponse.json({
          success: false,
          message: 'Vercel环境SMTP连接失败',
          error: nodemailerError.message,
          errorType,
          solution,
          details: {
            host,
            port,
            user,
            code: nodemailerError.code,
            command: nodemailerError.command,
            vercelRegion: process.env.VERCEL_REGION
          },
          troubleshooting: {
            commonIssues: [
              '阿里云邮箱可能限制海外IP访问（Vercel服务器在海外）',
              '环境变量值可能被截断或包含特殊字符',
              '网络防火墙可能阻止SMTP连接',
              'SMTP服务器可能需要白名单设置'
            ],
            nextSteps: [
              '1. 尝试使用Gmail作为备用SMTP服务',
              '2. 联系阿里云客服确认海外IP访问策略',
              '3. 检查Vercel项目的网络设置',
              '4. 考虑使用第三方邮件服务（如SendGrid、Mailgun）'
            ]
          }
        });
      }
    }

    if (action === 'test-vercel-send') {
      // 在Vercel环境发送测试邮件
      console.log('📧 [Vercel] 开始发送测试邮件...');
      
      try {
        const testInquiry = {
          fullName: 'Vercel测试用户',
          email: 'test@example.com',
          phone: '+1234567890',
          company: 'Vercel测试公司',
          message: '这是来自Vercel环境的测试询盘邮件，用于验证邮件发送功能是否正常工作。',
          productModel: 'MasterBend 11025',
          ipAddress: '192.168.1.100',
          country: 'China'
        };

        const success = await sendInquiryNotification(testInquiry);
        
        return NextResponse.json({
          success,
          message: success ? 'Vercel环境邮件发送成功' : 'Vercel环境邮件发送失败',
          testData: testInquiry,
          environment: {
            vercelEnv: process.env.VERCEL_ENV,
            vercelRegion: process.env.VERCEL_REGION,
            nodeEnv: process.env.NODE_ENV
          }
        });

      } catch (error) {
        const emailError = error as Error;
        console.error('❌ [Vercel] 邮件发送失败:', emailError);
        
        return NextResponse.json({
          success: false,
          message: 'Vercel环境邮件发送失败',
          error: emailError.message,
          stack: emailError.stack,
          environment: {
            vercelEnv: process.env.VERCEL_ENV,
            vercelRegion: process.env.VERCEL_REGION,
            nodeEnv: process.env.NODE_ENV
          }
        });
      }
    }

    if (action === 'test-resend') {
      // 测试Resend SMTP配置
      console.log('📧 [Vercel] 测试Resend SMTP连接...');
      
      // 检查是否已配置Resend
      const isResendConfigured = 
        process.env.SMTP_HOST === 'smtp.resend.com' &&
        process.env.SMTP_USER === 'resend' &&
        process.env.SMTP_PASS?.startsWith('re_');

      if (!isResendConfigured) {
        return NextResponse.json({
          success: false,
          message: 'Resend配置检查失败',
          issues: {
            host: process.env.SMTP_HOST !== 'smtp.resend.com' ? 'SMTP_HOST应设置为smtp.resend.com' : null,
            user: process.env.SMTP_USER !== 'resend' ? 'SMTP_USER应设置为resend' : null,
            apiKey: !process.env.SMTP_PASS?.startsWith('re_') ? 'SMTP_PASS应设置为Resend API Key（以re_开头）' : null
          },
          current: {
            SMTP_HOST: process.env.SMTP_HOST || '未设置',
            SMTP_USER: process.env.SMTP_USER || '未设置',
            SMTP_PASS: process.env.SMTP_PASS ? 
              (process.env.SMTP_PASS.startsWith('re_') ? '✅ Resend API Key' : '❌ 非Resend API Key') : 
              '未设置'
          },
          instructions: [
            '1. 访问 https://resend.com 注册账户',
            '2. 创建API Key，复制以re_开头的密钥',
            '3. 在Vercel环境变量中设置：',
            '   SMTP_HOST=smtp.resend.com',
            '   SMTP_PORT=587',
            '   SMTP_USER=resend',
            '   SMTP_PASS=your-resend-api-key',
            '4. 重新部署应用'
          ]
        });
      }

      try {
        // 使用Resend特定配置进行测试
        const transporter = nodemailer.createTransport({
          host: 'smtp.resend.com',
          port: 587,
          secure: false,
          auth: {
            user: 'resend',
            pass: process.env.SMTP_PASS
          },
          // Resend特定配置
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
          debug: true,
          logger: true
        });

        console.log('🔗 [Vercel] 连接Resend SMTP服务器...');
        const start = Date.now();
        await transporter.verify();
        const duration = Date.now() - start;
        console.log(`✅ [Vercel] Resend SMTP连接成功，耗时: ${duration}ms`);

        // 发送测试邮件
        const testResult = await transporter.sendMail({
          from: 'HARSLE <notification@harsle.com>', // 使用Resend的测试域名
          to: process.env.NOTIFICATION_EMAIL || 'test@example.com',
          subject: '🎉 Resend邮件测试 - HARSLE',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">🎉 Resend邮件服务测试成功！</h2>
              <p>恭喜！您的Vercel应用已成功配置Resend邮件服务。</p>
              
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3>✅ 配置信息:</h3>
                <ul>
                  <li><strong>服务商:</strong> Resend</li>
                  <li><strong>SMTP服务器:</strong> smtp.resend.com</li>
                  <li><strong>端口:</strong> 587</li>
                  <li><strong>发送时间:</strong> ${new Date().toLocaleString('zh-CN')}</li>
                  <li><strong>Vercel区域:</strong> ${process.env.VERCEL_REGION || 'unknown'}</li>
                </ul>
              </div>
              
              <p style="color: #059669;">现在您的询盘邮件将通过Resend可靠地发送！</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                此邮件由HARSLE股权分析机平台自动发送 | Powered by Resend
              </p>
            </div>
          `,
          text: `
Resend邮件服务测试成功！

配置信息:
- 服务商: Resend  
- SMTP服务器: smtp.resend.com
- 端口: 587
- 发送时间: ${new Date().toLocaleString('zh-CN')}
- Vercel区域: ${process.env.VERCEL_REGION || 'unknown'}

现在您的询盘邮件将通过Resend可靠地发送！
          `
        });

        return NextResponse.json({
          success: true,
          message: 'Resend配置测试成功',
          connection: {
            host: 'smtp.resend.com',
            port: 587,
            connectionTime: `${duration}ms`,
            vercelRegion: process.env.VERCEL_REGION
          },
          email: {
            messageId: testResult.messageId,
            accepted: testResult.accepted,
            rejected: testResult.rejected,
            response: testResult.response
          },
          note: '测试邮件已发送，请检查收件箱'
        });

      } catch (error) {
        const resendError = error as NodemailerError;
        console.error('❌ [Vercel] Resend测试失败:', resendError);
        
        return NextResponse.json({
          success: false,
          message: 'Resend配置测试失败',
          error: resendError.message,
          code: resendError.code,
          troubleshooting: [
            '1. 确认API Key正确（以re_开头）',
            '2. 检查API Key是否有发送权限',
            '3. 确认从邮箱地址已验证',
            '4. 查看Resend Dashboard的发送日志'
          ]
        });
      }
    }

    if (action === 'test-alternatives') {
      // 提供备用方案
      return NextResponse.json({
        success: true,
        message: '邮件服务备用方案',
        alternatives: {
          resend: {
            title: 'Resend (推荐)',
            description: 'Vercel官方推荐的现代化邮件API服务',
            config: {
              SMTP_HOST: 'smtp.resend.com',
              SMTP_PORT: '587',
              SMTP_USER: 'resend',
              SMTP_PASS: 'your-resend-api-key'
            },
            advantages: [
              'Vercel官方推荐，完美集成',
              '现代化API设计，开发者友好',
              '优秀的送达率和可靠性',
              '免费额度：每月3000封邮件',
              '支持域名验证和DKIM',
              '详细的发送统计和日志'
            ],
            setup: [
              '1. 访问 resend.com 注册账户',
              '2. 创建API Key（格式：re_xxxxxxxxx）',
              '3. 在Vercel环境变量中配置：',
              '   SMTP_HOST=smtp.resend.com',
              '   SMTP_PORT=587',
              '   SMTP_USER=resend',
              '   SMTP_PASS=your-resend-api-key',
              '4. 重新部署应用'
            ]
          },
          gmail: {
            title: 'Gmail SMTP',
            description: '使用Gmail作为SMTP服务器',
            config: {
              SMTP_HOST: 'smtp.gmail.com',
              SMTP_PORT: '587',
              SMTP_USER: 'your-email@gmail.com',
              SMTP_PASS: 'your-app-password'
            },
            steps: [
              '1. 在Gmail开启两步验证',
              '2. 生成应用专用密码',
              '3. 在Vercel环境变量中配置上述设置',
              '4. 重新部署应用'
            ]
          },
          sendgrid: {
            title: 'SendGrid',
            description: '使用SendGrid专业邮件服务',
            config: {
              SMTP_HOST: 'smtp.sendgrid.net',
              SMTP_PORT: '587',
              SMTP_USER: 'apikey',
              SMTP_PASS: 'your-sendgrid-api-key'
            },
            advantages: [
              '专为海外发送优化',
              '高可靠性和送达率',
              '详细的发送统计',
              '免费额度：每月100封'
            ]
          }
        },
        recommendation: 'Resend是当前最佳选择，特别适合Vercel部署的应用'
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: '无效的操作',
      availableActions: [
        'check-env',
        'test-vercel-connection', 
        'test-vercel-send',
        'test-alternatives'
      ]
    });

  } catch (error) {
    const apiError = error as Error;
    console.error('❌ [Vercel] API错误:', apiError);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Vercel调试API错误',
        error: apiError.message,
        stack: apiError.stack
      },
      { status: 500 }
    );
  }
} 