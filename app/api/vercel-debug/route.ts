import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendInquiryNotification } from '@/lib/email';

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

      } catch (error: any) {
        console.error('❌ [Vercel] SMTP连接失败:', error);
        
        // 分析错误类型
        let errorType = 'unknown';
        let solution = '';
        
        if (error.code === 'ECONNREFUSED') {
          errorType = 'connection_refused';
          solution = '无法连接到SMTP服务器，可能是网络问题或服务器地址错误';
        } else if (error.code === 'ENOTFOUND') {
          errorType = 'dns_error';
          solution = 'DNS解析失败，请检查SMTP服务器地址';
        } else if (error.code === 'ETIMEDOUT') {
          errorType = 'timeout';
          solution = '连接超时，可能是网络延迟或防火墙阻止';
        } else if (error.responseCode === 535) {
          errorType = 'auth_failed';
          solution = '认证失败，请检查用户名和密码';
        } else if (error.message.includes('Certificate')) {
          errorType = 'certificate_error';
          solution = 'SSL证书问题，可能需要配置TLS选项';
        }

        return NextResponse.json({
          success: false,
          message: 'Vercel环境SMTP连接失败',
          error: error.message,
          errorType,
          solution,
          details: {
            host,
            port,
            user,
            code: error.code,
            command: error.command,
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

      } catch (error: any) {
        console.error('❌ [Vercel] 邮件发送失败:', error);
        
        return NextResponse.json({
          success: false,
          message: 'Vercel环境邮件发送失败',
          error: error.message,
          stack: error.stack,
          environment: {
            vercelEnv: process.env.VERCEL_ENV,
            vercelRegion: process.env.VERCEL_REGION,
            nodeEnv: process.env.NODE_ENV
          }
        });
      }
    }

    if (action === 'test-alternatives') {
      // 提供备用方案
      return NextResponse.json({
        success: true,
        message: '邮件服务备用方案',
        alternatives: {
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
          },
          resend: {
            title: 'Resend',
            description: '现代化邮件API服务',
            config: {
              SMTP_HOST: 'smtp.resend.com',
              SMTP_PORT: '587',
              SMTP_USER: 'resend',
              SMTP_PASS: 'your-resend-api-key'
            },
            advantages: [
              '开发者友好',
              'Vercel官方推荐',
              '优秀的送达率',
              '免费额度：每月3000封'
            ]
          }
        }
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

  } catch (error: any) {
    console.error('❌ [Vercel] API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Vercel调试API错误',
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 