import { NextRequest, NextResponse } from 'next/server';
import { moveMachinePosition, reorderMachines, updateMachineSortOrder } from '@/lib/supabase/machines-admin';
import { createClient } from '@/lib/supabase/server';

// POST: 移动机器位置（上移/下移）
export async function POST(request: NextRequest) {
  try {
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { machineId, direction } = await request.json();
    
    if (!machineId || !direction) {
      return NextResponse.json({ error: '机器ID和移动方向是必需的' }, { status: 400 });
    }
    
    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json({ error: '移动方向必须是up或down' }, { status: 400 });
    }
    
    const result = await moveMachinePosition(machineId, direction);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/admin/machines/reorder:', error);
    return NextResponse.json({ error: '移动机器位置失败' }, { status: 500 });
  }
}

// PUT: 设置单个机器的排序位置
export async function PUT(request: NextRequest) {
  try {
    // 验证用户是否登录
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { machineId, sortOrder } = await request.json();
    
    if (!machineId || typeof sortOrder !== 'number' || sortOrder <= 0) {
      return NextResponse.json({ error: '机器ID和有效的排序号是必需的' }, { status: 400 });
    }
    
    const result = await updateMachineSortOrder(machineId, sortOrder);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PUT /api/admin/machines/reorder:', error);
    return NextResponse.json({ error: '更新排序失败' }, { status: 500 });
  }
} 