import { createClient } from './server';

export interface PublicMachine {
  id: string;
  model: string;
  stock: number;
  production_date: string;
  specifications: Record<string, string>;
  tooling_drawing_url?: string;
  image_urls: string[];
}

/**
 * Get all machines for public display (server-side)
 */
export async function getPublicMachines(): Promise<PublicMachine[]> {
  try {
    console.log('🔍 [getPublicMachines] 开始获取机器数据...');
    
    const supabase = await createClient();
    console.log('✅ [getPublicMachines] 服务器客户端创建成功');
    
    const { data, error } = await supabase
      .from('machines')
      .select('id, model, stock, production_date, specifications, tooling_drawing_url, image_urls, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [getPublicMachines] 数据库查询错误:', error);
      return [];
    }

    console.log('✅ [getPublicMachines] 查询成功，找到', data?.length || 0, '台机器');
    
    if (!data || data.length === 0) {
      console.warn('⚠️ [getPublicMachines] 数据库中没有机器数据');
      return [];
    }

    return data as PublicMachine[];
  } catch (err) {
    console.error('❌ [getPublicMachines] 意外错误:', err);
    return [];
  }
}

/**
 * Format production date for display
 */
export function formatProductionDate(date: string): string {
  const prodDate = new Date(date);
  return prodDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
} 