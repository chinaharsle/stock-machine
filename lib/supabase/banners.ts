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
 * Get all banners
 */
export async function getAllBanners(): Promise<Banner[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching banners:', error);
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
    console.error('Error fetching active banners:', error);
    return [];
  }

  return data as Banner[];
}

/**
 * Create a new banner
 */
export async function createBanner(banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<Banner | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .insert(banner)
    .select()
    .single();

  if (error) {
    console.error('Error creating banner:', error);
    return null;
  }

  return data as Banner;
}

/**
 * Update a banner
 */
export async function updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating banner:', error);
    return null;
  }

  return data as Banner;
}

/**
 * Delete a banner
 */
export async function deleteBanner(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting banner:', error);
    return false;
  }

  return true;
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
    console.error('Error uploading banner image:', error);
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