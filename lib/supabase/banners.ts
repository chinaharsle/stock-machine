import { createClient } from './client';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  background_image_url?: string;
  background_style: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Helper function to safely log errors with detailed information
 */
function logBannerError(context: string, error: unknown) {
  // Skip logging for empty errors
  if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
    console.log(`${context}: Empty error object - operation may have failed silently`);
    return;
  }

  const errorObj = error as Record<string, unknown>;
  const errorInfo = {
    fullError: error,
    code: errorObj?.code || 'N/A',
    message: errorObj?.message || 'N/A',
    details: errorObj?.details || 'N/A',
    hint: errorObj?.hint || 'N/A',
    status: errorObj?.status || 'N/A',
    statusCode: errorObj?.statusCode || 'N/A'
  };

  // Only log if we have meaningful error information
  const hasRealError = errorInfo.code !== 'N/A' || errorInfo.message !== 'N/A' || errorInfo.details !== 'N/A';
  
  if (hasRealError) {
    console.error(`Error in ${context}:`, errorInfo);
  } else {
    console.log(`${context}: No detailed error information available`);
  }
}

/**
 * Check if current user is admin (simplified version for client-side)
 */
async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Failed to get current user:', userError);
      return false;
    }

    // Try to check admin status - this may fail due to RLS
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .eq('is_admin', true)
      .single();

    if (error) {
      // If no record found or RLS blocked, assume not admin
      if (error.code === 'PGRST116') {
        console.log('No admin record found for user');
        return false;
      }
      // RLS might block this query, so we'll rely on server-side checks
      return false;
    }

    return data?.is_admin || false;
  } catch (err) {
    console.error('Unexpected error checking admin status:', err);
    return false;
  }
}

/**
 * Get all banners
 */
export async function getAllBanners(): Promise<Banner[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    logBannerError('getAllBanners', error);
    return [];
  }

  return data as Banner[];
}

/**
 * Get active banners for public display
 */
export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    logBannerError('getActiveBanners', error);
    return [];
  }

  return data as Banner[];
}

/**
 * Create a new banner
 */
export async function createBanner(banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<Banner | null> {
  // Check admin permission first
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error('创建横幅失败：用户没有管理员权限');
    return null;
  }

  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .insert(banner)
    .select()
    .single();

  if (error) {
    logBannerError('createBanner', error);
    return null;
  }

  return data as Banner;
}

/**
 * Update a banner
 */
export async function updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
  // Check admin permission first
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error('更新横幅失败：用户没有管理员权限');
    return null;
  }

  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logBannerError('updateBanner', error);
    return null;
  }

  return data as Banner;
}

/**
 * Delete a banner using server-side API
 */
export async function deleteBanner(id: string): Promise<boolean> {
  try {
    console.log('开始删除横幅，ID:', id);
    
    const response = await fetch(`/api/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('删除横幅失败:', errorData.error);
      return false;
    }

    const result = await response.json();
    console.log('横幅删除成功:', result.message);
    return true;
  } catch (err) {
    console.error('删除横幅时发生意外错误:', err);
    return false;
  }
}

/**
 * Upload banner background image
 */
export async function uploadBannerImage(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  
  const timestamp = Date.now();
  const path = `${userId}/banners/${timestamp}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('library')
    .upload(path, file);

  if (error) {
    logBannerError('uploadBannerImage', error);
    return null;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('library')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get available background styles
 */
export function getBackgroundStyles(): Array<{value: string, label: string, preview: string}> {
  return [
    { value: 'slide-bg-1', label: 'Blue Gradient', preview: 'linear-gradient(135deg, #1092E3 0%, #5484DF 100%)' },
    { value: 'slide-bg-2', label: 'Teal Gradient', preview: 'linear-gradient(135deg, #5484DF 0%, #4BA0C5 100%)' },
    { value: 'slide-bg-3', label: 'Orange Gradient', preview: 'linear-gradient(135deg, #E4600A 0%, #ff7675 100%)' },
    { value: 'slide-bg-4', label: 'Purple Gradient', preview: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' },
    { value: 'slide-bg-5', label: 'Green Gradient', preview: 'linear-gradient(135deg, #00b894 0%, #55a3ff 100%)' },
    { value: 'slide-bg-6', label: 'Dark Gradient', preview: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)' },
    { value: 'custom', label: 'Custom Image', preview: '' }
  ];
} 