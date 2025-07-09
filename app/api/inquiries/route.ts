import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 使用服务器端客户端绕过RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { inquiryData } = await request.json();
    
    // 从请求头中获取真实IP地址作为备选
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const serverIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    console.log('Request IP info:', { 
      serverIp, 
      forwardedFor, 
      realIp, 
      clientIp: inquiryData.ipAddress,
      clientCountry: inquiryData.country 
    });

    if (!inquiryData || !inquiryData.fullName || !inquiryData.email) {
      return NextResponse.json(
        { error: '询盘数据不完整' },
        { status: 400 }
      );
    }

    // 基本数据
    const insertData = {
      full_name: inquiryData.fullName,
      email: inquiryData.email,
      phone: inquiryData.phone,
      company_name: inquiryData.company,
      message: inquiryData.message,
      product_model: inquiryData.productModel,
      status: 'pending'
    };

    // 尝试添加IP地址和国家信息（如果数据库支持）
    try {
      const testInsert = {
        ...insertData,
        ip_address: inquiryData.ipAddress || serverIp,
        country: inquiryData.country
      };

      // 尝试插入完整数据
      const { data: fullData, error: fullError } = await supabase
        .from('inquiries')
        .insert([testInsert])
        .select();

      if (fullError) {
        // 如果失败，回退到基本数据
        console.log('IP/Country fields not available, using basic data');
        const { data: basicData, error: basicError } = await supabase
          .from('inquiries')
          .insert([insertData])
          .select();

        if (basicError) {
          console.error('Basic insert failed:', basicError);
          throw basicError;
        }

        console.log('Basic inquiry saved successfully');
      } else {
        console.log('Full inquiry with IP/Country saved successfully');
      }

    } catch (error) {
      console.error('Insert error:', error);
      throw error;
    }

    console.log('IP and Country info (attempted):', {
      ip: inquiryData.ipAddress || serverIp,
      country: inquiryData.country
    });

    // 保存逻辑已经在上面的try-catch块中处理了

    // 发送邮件通知（简化版本）
    await sendEmailNotification(inquiryData);

    return NextResponse.json({
      success: true,
      message: '询盘已提交'
    });

  } catch (error) {
    console.error('Function error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(inquiryData: {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  productModel?: string;
  ipAddress?: string;
  country?: string;
}) {
  // 这里可以添加邮件发送逻辑
  // 暂时只记录到控制台
  console.log('New inquiry received:', {
    fullName: inquiryData.fullName,
    email: inquiryData.email,
    phone: inquiryData.phone,
    company: inquiryData.company,
    message: inquiryData.message,
    productModel: inquiryData.productModel,
    ipAddress: inquiryData.ipAddress,
    country: inquiryData.country
  });
} 