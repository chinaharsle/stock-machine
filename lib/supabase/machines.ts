import { createClient } from './client';

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
}

/**
 * Get all machines
 */
export async function getAllMachines(): Promise<Machine[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching machines:', error);
    return [];
  }

  return data as Machine[];
}

/**
 * Get a single machine by ID
 */
export async function getMachine(id: string): Promise<Machine | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching machine:', error);
    return null;
  }

  return data as Machine;
}

/**
 * Create a new machine
 */
export async function createMachine(machine: Omit<Machine, 'id' | 'created_at' | 'updated_at'>): Promise<Machine | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('machines')
    .insert(machine)
    .select()
    .single();

  if (error) {
    console.error('Error creating machine:', error);
    return null;
  }

  return data as Machine;
}

/**
 * Update a machine
 */
export async function updateMachine(id: string, updates: Partial<Machine>): Promise<Machine | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('machines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating machine:', error);
    return null;
  }

  return data as Machine;
}

/**
 * Delete a machine
 */
export async function deleteMachine(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting machine:', error);
    return false;
  }

  return true;
}

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(file: File, path: string): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase.storage
    .from('library')
    .upload(path, file);

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('library')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from('library')
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }

  return true;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

 