import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Failed to get current user:', userError);
      return false;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .eq('is_admin', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No admin record found for user');
        return false;
      }
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (err) {
    console.error('Unexpected error checking admin status:', err);
    return false;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bannerId = params.id;
    
    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    console.log('开始删除横幅，ID:', bannerId);
    
    // Check admin permission first
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('删除横幅失败：用户没有管理员权限');
      return NextResponse.json({ error: '删除横幅失败：用户没有管理员权限' }, { status: 403 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    
    // First, verify the banner exists
    const { data: existingBanner, error: fetchError } = await adminClient
      .from('banners')
      .select('id, title')
      .eq('id', bannerId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.error('删除失败：横幅不存在');
        return NextResponse.json({ error: '删除失败：横幅不存在' }, { status: 404 });
      }
      console.error('删除失败 - 查询横幅错误:', fetchError);
      return NextResponse.json({ error: '删除失败：查询横幅时发生错误' }, { status: 500 });
    }

    console.log('找到要删除的横幅:', existingBanner);

    // Perform the deletion using admin client
    const { error: deleteError } = await adminClient
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (deleteError) {
      console.error('删除失败 - 删除操作错误:', deleteError);
      
      // Provide more specific error messages
      if (deleteError.code === '42501') {
        return NextResponse.json({ error: '删除失败：权限不足' }, { status: 403 });
      } else if (deleteError.code === '23503') {
        return NextResponse.json({ error: '删除失败：存在外键约束，横幅可能被其他数据引用' }, { status: 409 });
      } else {
        return NextResponse.json({ error: '删除失败：未知数据库错误' }, { status: 500 });
      }
    }

    console.log('横幅删除成功');
    return NextResponse.json({ 
      success: true, 
      message: '横幅删除成功',
      deletedBanner: existingBanner 
    });

  } catch (err) {
    console.error('删除横幅时发生意外错误:', err);
    return NextResponse.json({ 
      error: '删除横幅时发生意外错误', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
} 