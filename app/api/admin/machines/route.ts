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
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const machines = await getAllMachinesAdmin();
    return NextResponse.json({ success: true, data: machines });
  } catch (error) {
    console.error('Error in GET /api/admin/machines:', error);
    return NextResponse.json({ error: '获取机器数据失败' }, { status: 500 });
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