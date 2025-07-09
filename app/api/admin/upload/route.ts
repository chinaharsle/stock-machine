import { NextRequest, NextResponse } from 'next/server';
import { uploadFileAdmin } from '@/lib/supabase/machines-admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'drawing'
    
    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }
    
    // 生成文件路径
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    const path = type === 'drawing' 
      ? `${user.id}/drawings/${fileName}`
      : `${user.id}/images/${fileName}`;
    
    const result = await uploadFileAdmin(file, path);
    
    if (result.success) {
      return NextResponse.json({ success: true, url: result.url });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/admin/upload:', error);
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
  }
} 