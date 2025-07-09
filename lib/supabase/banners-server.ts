import { createClient } from './server';

export interface PublicBanner {
  id: string;
  title: string;
  subtitle?: string;
  background_image_url?: string;
  background_style: string;
  display_order: number;
}

/**
 * Get active banners for public display (server-side)
 */
export async function getActiveBanners(): Promise<PublicBanner[]> {
  try {
    console.log('🔍 [getActiveBanners] 开始获取横幅数据...');
    
    const supabase = await createClient();
    console.log('✅ [getActiveBanners] 服务器客户端创建成功');
    
    const { data, error } = await supabase
      .from('banners')
      .select('id, title, subtitle, background_image_url, background_style, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ [getActiveBanners] 数据库查询错误:', error);
      return [];
    }

    console.log('✅ [getActiveBanners] 查询成功，找到', data?.length || 0, '个横幅');
    
    if (!data || data.length === 0) {
      console.warn('⚠️ [getActiveBanners] 数据库中没有激活的横幅数据');
      return [];
    }

    return data as PublicBanner[];
  } catch (err) {
    console.error('❌ [getActiveBanners] 意外错误:', err);
    return [];
  }
} 