import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST() {
  try {
    const email = process.env.SMTP_USER;
    const password = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST;

    if (!email || !password || !host) {
      return NextResponse.json({
        success: false,
        message: '邮件配置不完整'
      });
    }

    // 提取邮箱用户名
    const emailUser = email.split('@')[0]; // notification

    const testConfigs = [
      {
        name: '完整邮箱地址认证',
        auth: { user: email, pass: password }
      },
      {
        name: '用户名认证',
        auth: { user: emailUser, pass: password }
      }
    ];

    const results = [];

    for (const config of testConfigs) {
      try {
        console.log(`🧪 测试: ${config.name}, 用户名: ${config.auth.user}`);

        const transporter = nodemailer.createTransport({
          host: host,
          port: 587,
          secure: false,
          auth: config.auth,
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000
        });

        await transporter.verify();
        
        results.push({
          name: config.name,
          user: config.auth.user,
          success: true,
          message: '认证成功'
        });

        console.log(`✅ ${config.name} 认证成功!`);
        break; // 找到成功的配置就停止测试

      } catch (error: unknown) {
        console.log(`❌ ${config.name} 认证失败: ${error instanceof Error ? error.message : String(error)}`);
        results.push({
          name: config.name,
          user: config.auth.user,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          code: error instanceof Error && 'code' in error ? error.code : undefined
        });
      }
    }

    return NextResponse.json({
      success: results.some(r => r.success),
      message: '阿里云邮箱认证测试完成',
      results: results,
      recommendation: results.find(r => r.success) ? 
        `建议使用: ${results.find(r => r.success)?.name}` : 
        '所有认证方式都失败，请检查密码或联系邮箱管理员'
    });

  } catch (error: unknown) {
    console.error('测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 