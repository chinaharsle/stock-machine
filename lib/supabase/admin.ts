import { createClient } from './server';
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Create admin client with service role key for admin operations
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

/**
 * Helper function to safely log errors
 */
function logError(context: string, error: any) {
  console.error(`Error in ${context}:`, {
    fullError: error,
    code: error?.code || 'N/A',
    message: error?.message || 'N/A',
    details: error?.details || 'N/A',
    hint: error?.hint || 'N/A',
    status: error?.status || 'N/A',
    statusCode: error?.statusCode || 'N/A'
  });
}

/**
 * Check if any admin users exist in the system
 */
export async function hasAdminUsers(): Promise<boolean> {
  try {
    const supabase = createAdminClient(); // Use admin client to bypass RLS
    const { data, error } = await supabase.rpc('has_admin_users');
    
    if (error) {
      logError('hasAdminUsers', error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error('❌ Unexpected error checking admin users existence:', err);
    return false;
  }
}

/**
 * Bootstrap the first admin user using the secure function
 */
export async function bootstrapFirstAdmin(userAuth: { id: string; email: string; user_metadata?: { full_name?: string } }): Promise<AdminUser | null> {
  try {
    console.log('🚀 Bootstrapping first admin user:', { userId: userAuth.id, email: userAuth.email });
    const supabase = createAdminClient(); // Use admin client to bypass RLS
    
    const { data, error } = await supabase.rpc('bootstrap_first_admin', {
      p_user_id: userAuth.id,
      p_email: userAuth.email,
      p_name: userAuth.user_metadata?.full_name || userAuth.email?.split('@')[0]
    });
    
    if (error) {
      logError('bootstrapFirstAdmin', error);
      return null;
    }
    
    console.log('✅ First admin user bootstrapped successfully:', data);
    return data?.[0] as AdminUser;
  } catch (err) {
    console.error('❌ Unexpected error bootstrapping first admin user:', err);
    return null;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    console.log('🔍 Checking admin status for user:', userId);
    const supabase = createAdminClient(); // Use admin client to bypass RLS
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', userId)
      .eq('is_admin', true)
      .single();

    if (error) {
      // If no record found, user is not an admin
      if (error.code === 'PGRST116') {
        console.log('📋 No admin record found for user, returning false');
        return false;
      }
      
      console.error('❌ Error from isUserAdmin query:', error);
      logError('isUserAdmin', error);
      return false;
    }

    console.log('✅ Admin check result:', data);
    return data?.is_admin || false;
  } catch (err) {
    console.error('❌ Unexpected error checking admin status:', err);
    return false;
  }
}

/**
 * Get admin user profile
 */
export async function getAdminUserProfile(userId: string): Promise<AdminUser | null> {
  const supabase = createAdminClient(); // Use admin client to bypass RLS
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    logError('getAdminUserProfile', error);
    return null;
  }

  return data as AdminUser;
}

/**
 * Create or update admin user
 */
export async function createOrUpdateAdminUser(userAuth: { id: string; email: string; user_metadata?: { full_name?: string } }, isAdmin: boolean = false): Promise<AdminUser | null> {
  try {
    console.log('🔧 Creating/updating admin user:', { userId: userAuth.id, email: userAuth.email, isAdmin });
    const supabase = createAdminClient(); // Use admin client to bypass RLS
    
    const userData = {
      user_id: userAuth.id,
      email: userAuth.email,
      name: userAuth.user_metadata?.full_name || userAuth.email?.split('@')[0],
      is_admin: isAdmin,
      last_login: new Date().toISOString()
    };

    console.log('📝 User data to upsert:', userData);

    const { data, error } = await supabase
      .from('admin_users')
      .upsert(userData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      logError('createOrUpdateAdminUser', error);
      return null;
    }

    console.log('✅ Admin user created/updated successfully:', data);
    return data as AdminUser;
  } catch (err) {
    console.error('❌ Unexpected error creating/updating admin user:', err);
    return null;
  }
}

/**
 * Update last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = createAdminClient(); // Use admin client to bypass RLS
  
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('user_id', userId);
}

/**
 * Get all admin users (for initial setup check)
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    console.log('📋 Fetching all admin users...');
    const supabase = createAdminClient(); // Use admin client to bypass RLS
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logError('getAllAdminUsers', error);
      return [];
    }

    console.log('📊 Found admin users:', data?.length || 0);
    return data as AdminUser[];
  } catch (err) {
    console.error('❌ Unexpected error fetching admin users:', err);
    return [];
  }
}

/**
 * Toggle admin status for a user
 */
export async function toggleAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
  const supabase = createAdminClient(); // Use admin client to bypass RLS
  
  const { error } = await supabase
    .from('admin_users')
    .update({ is_admin: isAdmin })
    .eq('user_id', userId);

  if (error) {
    logError('toggleAdminStatus', error);
    return false;
  }

  return true;
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(userId: string): Promise<boolean> {
  const supabase = createAdminClient(); // Use admin client to bypass RLS
  
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('user_id', userId);

  if (error) {
    logError('deleteAdminUser', error);
    return false;
  }

  return true;
} 