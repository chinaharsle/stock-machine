import { createClient } from '@supabase/supabase-js';

export interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name?: string;
  message: string;
  product_model?: string;
  ip_address?: string;
  country?: string;
  status: 'pending' | 'processing' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface FormattedInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  productModel?: string;
  status: 'pending' | 'processing' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  country?: string;
}

// 创建服务客户端用于管理操作
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 获取所有询盘数据
export async function getInquiries(): Promise<FormattedInquiry[]> {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }

  return data.map(formatInquiry);
}

// 根据状态过滤询盘数据
export async function getInquiriesByStatus(status: string): Promise<FormattedInquiry[]> {
  if (status === 'all') {
    return getInquiries();
  }

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inquiries by status:', error);
    return [];
  }

  return data.map(formatInquiry);
}

// 更新询盘状态
export async function updateInquiryStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating inquiry status:', error);
    return false;
  }

  return true;
}

// 删除询盘
export async function deleteInquiry(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting inquiry:', error);
    return false;
  }

  return true;
}

// 格式化询盘数据
function formatInquiry(inquiry: Inquiry): FormattedInquiry {
  return {
    id: inquiry.id,
    fullName: inquiry.full_name,
    email: inquiry.email,
    phone: inquiry.phone,
    company: inquiry.company_name,
    message: inquiry.message,
    productModel: inquiry.product_model,
    status: inquiry.status,
    createdAt: inquiry.created_at,
    updatedAt: inquiry.updated_at,
    ipAddress: inquiry.ip_address,
    country: inquiry.country
  };
}

// 获取询盘统计
export async function getInquiriesStats() {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('status');

  if (error) {
    console.error('Error fetching inquiry stats:', error);
    return {
      total: 0,
      pending: 0,
      processing: 0,
      replied: 0,
      closed: 0
    };
  }

  const stats = data.reduce((acc, inquiry) => {
    acc.total++;
    if (inquiry.status === 'pending') acc.pending++;
    if (inquiry.status === 'processing') acc.processing++;
    if (inquiry.status === 'replied') acc.replied++;
    if (inquiry.status === 'closed') acc.closed++;
    return acc;
  }, {
    total: 0,
    pending: 0,
    processing: 0,
    replied: 0,
    closed: 0
  });

  return stats;
} 