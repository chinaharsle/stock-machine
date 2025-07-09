import nodemailer from 'nodemailer';

// 邮件配置接口
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 产品参数接口
interface ProductSpecifications {
  [key: string]: string;
}

// 询盘数据接口
interface InquiryData {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  productModel?: string;
  productSpecs?: ProductSpecifications | null;
  ipAddress?: string;
  country?: string;
}

// 创建邮件传输器
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'resend',
      pass: process.env.SMTP_PASS || '',
    },
  };

  const transporterOptions = {
    ...config,
    // Vercel环境优化配置
    connectionTimeout: 30000,    // 30秒连接超时
    greetingTimeout: 15000,      // 15秒握手超时
    socketTimeout: 30000,        // 30秒socket超时
    // 调试选项（仅在开发环境启用）
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
    // TLS配置
    requireTLS: true,
    tls: {
      // 允许自签名证书（在某些环境中可能需要）
      rejectUnauthorized: false,
      // 最低TLS版本
      minVersion: 'TLSv1.2'
    }
  };

  // 如果是Vercel环境，添加额外的配置
  if (process.env.VERCEL) {
    console.log('🚀 [Vercel环境] 使用优化的邮件配置');
    Object.assign(transporterOptions, {
      pool: true,           // 启用连接池
      maxConnections: 5,    // 最大连接数
      rateDelta: 20000,     // 速率限制间隔
      rateLimit: 5          // 速率限制
    });
  }

  // Resend特定优化
  if (process.env.SMTP_HOST === 'smtp.resend.com') {
    console.log('📧 [Resend] 使用Resend专用配置');
    Object.assign(transporterOptions, {
      // Resend推荐的配置
      name: 'harsle.com',     // 标识符
      maxConnections: 10,     // Resend支持更多连接
      rateDelta: 1000,        // 更短的速率限制间隔
      rateLimit: 14,          // 每秒14封邮件（Resend限制）
      // 优化的超时配置
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
  }

  return nodemailer.createTransport(transporterOptions as Parameters<typeof nodemailer.createTransport>[0]);
};

// 获取产品参数信息 - 直接使用Supabase查询，避免HTTP调用
const getProductSpecifications = async (productModel: string): Promise<ProductSpecifications | null> => {
  try {
    // 动态导入Supabase客户端
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log(`🔍 [getProductSpecifications] 查询产品参数: ${productModel}`);

    const { data, error } = await supabase
      .from('machines')
      .select('model, specifications')
      .eq('model', productModel)
      .single();

    if (error) {
      console.error('❌ [getProductSpecifications] 数据库查询失败:', error);
      return null;
    }

    if (!data || !data.specifications) {
      console.log(`⚠️ [getProductSpecifications] 产品 ${productModel} 没有找到或没有参数`);
      return null;
    }

    console.log(`✅ [getProductSpecifications] 获取到产品参数:`, data.specifications);
    return data.specifications;
  } catch (error) {
    console.error('❌ [getProductSpecifications] 获取产品参数失败:', error);
    return null;
  }
};

// 生成询盘邮件HTML模板
const generateInquiryEmailTemplate = (data: InquiryData): string => {
  const currentTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 转换产品参数名称为友好显示格式
  const formatParameterName = (camelCaseKey: string): string => {
    // 特定参数名称映射
    const parameterNameMap: { [key: string]: string } = {
      'bendingLength': 'Bending Length',
      'bendingTonnage': 'Bending Tonnage',
      'operatingSystem': 'Operating System',
      'backgaugeAxis': 'Backgauge Axis',
      'strokeLength': 'Stroke Length',
      'openingHeight': 'Opening Height',
      'workingSpeed': 'Working Speed',
      'returnSpeed': 'Return Speed',
      'motorPower': 'Motor Power',
      'oilTankCapacity': 'Oil Tank Capacity',
      'machineWeight': 'Machine Weight',
      'machineDimensions': 'Machine Dimensions',
      'workingPressure': 'Working Pressure',
      'cncSystem': 'CNC System',
      'controlSystem': 'Control System',
      'hydraulicSystem': 'Hydraulic System',
      'electricalSystem': 'Electrical System',
      'toolingSystem': 'Tooling System',
      'safetySystem': 'Safety System'
    };

    // 如果有特定映射，使用映射
    if (parameterNameMap[camelCaseKey]) {
      return parameterNameMap[camelCaseKey];
    }

    // 通用转换：驼峰命名法转为标题格式
    return camelCaseKey
      // 在大写字母前添加空格
      .replace(/([A-Z])/g, ' $1')
      // 首字母大写
      .replace(/^./, str => str.toUpperCase())
      // 清理多余空格
      .trim();
  };

  // 生成产品参数HTML
  const generateProductSpecsHTML = (specs: ProductSpecifications): string => {
    if (!specs || Object.keys(specs).length === 0) {
      return '';
    }
    
    return Object.entries(specs)
      .map(([key, value]) => `
        <div class="spec-item">
          <span class="spec-label">${formatParameterName(key)}:</span>
          <span class="spec-value">${value}</span>
        </div>
      `)
      .join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>新的询盘通知</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 30px;
            }
            .info-card {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .info-row {
                display: flex;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }
            .info-label {
                font-weight: 600;
                color: #475569;
                min-width: 100px;
                margin-right: 15px;
            }
            .info-value {
                color: #1e293b;
                flex: 1;
            }
            .message-box {
                background-color: #fefefe;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
            }
            .message-box h3 {
                margin-top: 0;
                color: #374151;
                font-size: 16px;
            }
            .message-content {
                background-color: #f9fafb;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #2563eb;
                white-space: pre-wrap;
                font-size: 14px;
                line-height: 1.5;
            }
            .badge {
                display: inline-block;
                background-color: #dbeafe;
                color: #1e40af;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            .product-specs {
                margin-top: 10px;
                padding: 15px;
                background-color: #f0f9ff;
                border-radius: 6px;
                border: 1px solid #bae6fd;
            }
            .spec-item {
                display: flex;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }
            .spec-label {
                font-weight: 600;
                color: #0369a1;
                min-width: 150px;
                margin-right: 10px;
            }
            .spec-value {
                color: #0c4a6e;
                flex: 1;
            }
            .urgent {
                background-color: #fee2e2;
                color: #dc2626;
            }
            @media (max-width: 480px) {
                .info-row {
                    flex-direction: column;
                }
                .info-label {
                    min-width: auto;
                    margin-right: 0;
                    margin-bottom: 4px;
                }
                .spec-item {
                    flex-direction: column;
                }
                .spec-label {
                    min-width: auto;
                    margin-right: 0;
                    margin-bottom: 4px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 新的询盘通知</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">收到来自 ${data.fullName} 的询盘</p>
            </div>
            
            <div class="content">
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">📅 时间:</span>
                        <span class="info-value">${currentTime}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">👤 姓名:</span>
                        <span class="info-value">${data.fullName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📧 邮箱:</span>
                        <span class="info-value">
                            <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📱 WhatsApp:</span>
                        <span class="info-value">
                            <a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none;">${data.phone}</a>
                        </span>
                    </div>
                    ${data.company ? `
                    <div class="info-row">
                        <span class="info-label">🏢 公司:</span>
                        <span class="info-value">${data.company}</span>
                    </div>
                    ` : ''}
                    ${data.productModel ? `
                    <div class="info-row">
                        <span class="info-label">🏭 产品:</span>
                        <span class="info-value">
                            <span class="badge">${data.productModel}</span>
                            ${data.productSpecs ? `
                            <div class="product-specs">
                                <h4 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">📋 产品参数:</h4>
                                ${generateProductSpecsHTML(data.productSpecs)}
                            </div>
                            ` : ''}
                        </span>
                    </div>
                    ` : ''}
                    ${data.country ? `
                    <div class="info-row">
                        <span class="info-label">🌍 国家:</span>
                        <span class="info-value">${data.country}</span>
                    </div>
                    ` : ''}
                    ${data.ipAddress ? `
                    <div class="info-row">
                        <span class="info-label">🌐 IP地址:</span>
                        <span class="info-value">${data.ipAddress}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="message-box">
                    <h3>💬 询盘内容</h3>
                    <div class="message-content">${data.message}</div>
                </div>

                <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
                    <h3 style="margin-top: 0; color: #0369a1;">📋 后续操作建议</h3>
                    <ul style="margin: 10px 0; padding-left: 20px; color: #0c4a6e;">
                        <li>及时回复客户询盘 (建议24小时内)</li>
                        <li>提供详细的产品信息和报价</li>
                        <li>了解客户的具体需求和预算</li>
                        <li>安排产品演示或工厂参观</li>
                        <li>记录客户信息到CRM系统</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// 发送询盘通知邮件
export const sendInquiryNotification = async (inquiryData: InquiryData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // 如果有产品型号，获取产品参数
    let productSpecs: ProductSpecifications | null = null;
    if (inquiryData.productModel) {
      productSpecs = await getProductSpecifications(inquiryData.productModel);
    }
    
    // 创建包含产品参数的询盘数据
    const enrichedInquiryData = {
      ...inquiryData,
      productSpecs
    };

    const mailOptions = {
      from: {
        name: process.env.SMTP_FROM_NAME || 'HARSLE',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || ''
      },
      to: process.env.NOTIFICATION_EMAIL || '',
      subject: 'New Inquiry From HARSLE Stock Machine',
      html: generateInquiryEmailTemplate(enrichedInquiryData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', result);
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
};

// 测试邮件配置
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('邮件配置验证成功！');
    return true;
  } catch (error) {
    console.error('邮件连接失败详细信息:', error);
    return false;
  }
}; 