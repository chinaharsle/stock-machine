import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export interface Machine {
  id: string;
  model: string;
  stock: number;
  production_date: string;
  specifications: Record<string, string>;
  tooling_drawing_url?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  sort_order?: number;
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
function logError(context: string, error: unknown) {
  const errorObj = error as Record<string, unknown>;
  console.error(`Error in ${context}:`, {
    fullError: error,
    code: errorObj?.code || 'N/A',
    message: errorObj?.message || 'N/A',
    details: errorObj?.details || 'N/A',
    hint: errorObj?.hint || 'N/A',
    status: errorObj?.status || 'N/A',
    statusCode: errorObj?.statusCode || 'N/A'
  });
}

/**
 * Get all machines with admin privileges
 */
export async function getAllMachinesAdmin(): Promise<Machine[]> {
  try {
    console.log('🔍 Fetching all machines with admin privileges...');
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      logError('getAllMachinesAdmin', error);
      return [];
    }

    console.log('✅ Successfully fetched machines:', data?.length || 0);
    return data as Machine[];
  } catch (err) {
    console.error('❌ Unexpected error fetching machines:', err);
    return [];
  }
}

/**
 * Update a machine with admin privileges
 */
export async function updateMachineAdmin(id: string, updates: Partial<Machine>): Promise<{ success: boolean; data?: Machine; error?: string }> {
  try {
    console.log('🔄 Updating machine with admin privileges:', { id, updates });
    const supabase = createAdminClient();
    
    // Add updated_at timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('machines')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logError('updateMachineAdmin', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    console.log('✅ Machine updated successfully:', data);
    return { 
      success: true, 
      data: data as Machine 
    };
  } catch (err) {
    console.error('❌ Unexpected error updating machine:', err);
    return { 
      success: false, 
      error: '系统错误，请稍后重试' 
    };
  }
}

/**
 * Create a new machine with admin privileges
 */
export async function createMachineAdmin(machine: Omit<Machine, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Machine; error?: string }> {
  try {
    console.log('🆕 Creating new machine with admin privileges:', machine);
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('machines')
      .insert(machine)
      .select()
      .single();

    if (error) {
      logError('createMachineAdmin', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    console.log('✅ Machine created successfully:', data);
    return { 
      success: true, 
      data: data as Machine 
    };
  } catch (err) {
    console.error('❌ Unexpected error creating machine:', err);
    return { 
      success: false, 
      error: '系统错误，请稍后重试' 
    };
  }
}

/**
 * Delete a machine with admin privileges
 */
export async function deleteMachineAdmin(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Deleting machine with admin privileges:', id);
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', id);

    if (error) {
      logError('deleteMachineAdmin', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    console.log('✅ Machine deleted successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Unexpected error deleting machine:', err);
    return { 
      success: false, 
      error: '系统错误，请稍后重试' 
    };
  }
}

/**
 * Upload file to Supabase storage with admin privileges
 */
export async function uploadFileAdmin(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log('📤 Uploading file with admin privileges:', { fileName: file.name, path });
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.storage
      .from('library')
      .upload(path, file);

    if (error) {
      logError('uploadFileAdmin', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('library')
      .getPublicUrl(data.path);

    console.log('✅ File uploaded successfully:', publicUrlData.publicUrl);
    return { 
      success: true, 
      url: publicUrlData.publicUrl 
    };
  } catch (err) {
    console.error('❌ Unexpected error uploading file:', err);
    return { 
      success: false, 
      error: '文件上传失败，请稍后重试' 
    };
  }
}

/**
 * Delete file from Supabase storage with admin privileges
 */
export async function deleteFileAdmin(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Deleting file with admin privileges:', path);
    const supabase = createAdminClient();
    
    const { error } = await supabase.storage
      .from('library')
      .remove([path]);

    if (error) {
      logError('deleteFileAdmin', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    console.log('✅ File deleted successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Unexpected error deleting file:', err);
    return { 
      success: false, 
      error: '文件删除失败，请稍后重试' 
    };
  }
}

/**
 * Move machine position up or down
 */
export async function moveMachinePosition(machineId: string, direction: 'up' | 'down'): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Moving machine position:', { machineId, direction });
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.rpc('move_machine_position', {
      machine_id: machineId,
      direction: direction
    });

    if (error) {
      logError('moveMachinePosition', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    if (data === false) {
      return { 
        success: false, 
        error: '无法移动到该位置' 
      };
    }

    console.log('✅ Machine position moved successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Unexpected error moving machine position:', err);
    return { 
      success: false, 
      error: '移动机器位置失败，请稍后重试' 
    };
  }
}

/**
 * Update single machine sort order
 */
export async function updateMachineSortOrder(machineId: string, sortOrder: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Updating machine sort order:', { machineId, sortOrder });
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('machines')
      .update({ sort_order: sortOrder })
      .eq('id', machineId);

    if (error) {
      logError('updateMachineSortOrder', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    console.log('✅ Machine sort order updated successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Unexpected error updating machine sort order:', err);
    return { 
      success: false, 
      error: '更新排序失败，请稍后重试' 
    };
  }
}

/**
 * Reorder all machines by providing new order array
 */
export async function reorderMachines(machineIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Reordering machines:', machineIds);
    const supabase = createAdminClient();
    
    const { error } = await supabase.rpc('reorder_machines', {
      machine_ids: machineIds
    });

    if (error) {
      logError('reorderMachines', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }

    console.log('✅ Machines reordered successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Unexpected error reordering machines:', err);
    return { 
      success: false, 
      error: '重新排序失败，请稍后重试' 
    };
  }
} 