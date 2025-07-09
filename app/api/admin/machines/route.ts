import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllMachinesAdmin, 
  updateMachineAdmin, 
  createMachineAdmin, 
  deleteMachineAdmin 
} from '@/lib/supabase/machines-admin';
import { createClient } from '@/lib/supabase/server';

// GET: 获取所有机器
export async function GET() {
  try {
    console.log('🔍 [GET /api/admin/machines] 开始处理请求...');
    
    // 验证用户是否登录
    const supabase = await createClient();
    console.log('✅ [GET /api/admin/machines] Supabase客户端创建成功');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 [GET /api/admin/machines] 认证检查:', { hasUser: !!user, authError: authError?.message });
    
    if (authError) {
      console.error('❌ [GET /api/admin/machines] 认证错误:', authError);
      return NextResponse.json({ 
        success: false, 
        error: '认证失败', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.warn('⚠️ [GET /api/admin/machines] 用户未登录');
      return NextResponse.json({ 
        success: false, 
        error: '未授权访问，请先登录' 
      }, { status: 401 });
    }
    
    console.log('👤 [GET /api/admin/machines] 用户已认证:', user.email);
    
    const machines = await getAllMachinesAdmin();
    console.log('✅ [GET /api/admin/machines] 获取到机器数据:', machines.length, '台');
    
    return NextResponse.json({ success: true, data: machines });
  } catch (error) {
    console.error('❌ [GET /api/admin/machines] 服务器错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取机器数据失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// POST: 创建新机器
export async function POST(request: NextRequest) {
  try {
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const machineData = await request.json();
    
    // 确保有 created_by 字段
    const machineWithUser = {
      ...machineData,
      created_by: user.id
    };
    
    const result = await createMachineAdmin(machineWithUser);
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/admin/machines:', error);
    return NextResponse.json({ error: '创建机器失败' }, { status: 500 });
  }
}

// PUT: 更新机器
export async function PUT(request: NextRequest) {
  try {
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: '机器ID是必需的' }, { status: 400 });
    }
    
    const result = await updateMachineAdmin(id, updates);
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PUT /api/admin/machines:', error);
    return NextResponse.json({ error: '更新机器失败' }, { status: 500 });
  }
}

// DELETE: 删除机器
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '机器ID是必需的' }, { status: 400 });
    }
    
    const result = await deleteMachineAdmin(id);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/admin/machines:', error);
    return NextResponse.json({ error: '删除机器失败' }, { status: 500 });
  }
} 