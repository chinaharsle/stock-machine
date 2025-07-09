import { NextRequest, NextResponse } from 'next/server';
import { getInquiries, getInquiriesByStatus, getInquiriesStats } from '@/lib/supabase/inquiries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const statsOnly = searchParams.get('statsOnly');

    // 如果只请求统计数据
    if (statsOnly === 'true') {
      const stats = await getInquiriesStats();
      return NextResponse.json({ success: true, data: stats });
    }

    // 获取询盘列表
    const inquiries = status ? await getInquiriesByStatus(status) : await getInquiries();
    
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
} 