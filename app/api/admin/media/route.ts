import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'drawing' | 'attachment';
  source: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'image' | 'drawing' | 'attachment'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 从machines表获取已上传的文件URLs
    const mediaFiles: MediaFile[] = [];

    // 获取图片URLs
    if (!type || type === 'image') {
      const { data: machinesWithImages } = await supabase
        .from('machines')
        .select('image_urls, model, created_at')
        .not('image_urls', 'eq', '[]');

      if (machinesWithImages) {
        machinesWithImages.forEach(machine => {
          if (machine.image_urls && Array.isArray(machine.image_urls)) {
            machine.image_urls.forEach((url: string) => {
              mediaFiles.push({
                id: `img_${Date.now()}_${Math.random()}`,
                url,
                name: `${machine.model} - 产品图片`,
                type: 'image',
                source: 'machine',
                created_at: machine.created_at
              });
            });
          }
        });
      }
    }

    // 获取工具图纸URLs
    if (!type || type === 'drawing') {
      const { data: machinesWithDrawings } = await supabase
        .from('machines')
        .select('tooling_drawing_url, model, created_at')
        .not('tooling_drawing_url', 'is', null)
        .not('tooling_drawing_url', 'eq', '');

      if (machinesWithDrawings) {
        machinesWithDrawings.forEach(machine => {
          if (machine.tooling_drawing_url) {
            mediaFiles.push({
              id: `draw_${Date.now()}_${Math.random()}`,
              url: machine.tooling_drawing_url,
              name: `${machine.model} - 模具图纸`,
              type: 'drawing',
              source: 'machine',
              created_at: machine.created_at
            });
          }
        });
      }
    }

    // 获取附件URLs
    if (!type || type === 'attachment') {
      const { data: machinesWithAttachments } = await supabase
        .from('machines')
        .select('attachments, model, created_at')
        .not('attachments', 'is', null);

      if (machinesWithAttachments) {
        machinesWithAttachments.forEach(machine => {
          if (machine.attachments && Array.isArray(machine.attachments)) {
            machine.attachments.forEach((attachment: { url: string; name: string }) => {
              mediaFiles.push({
                id: `att_${Date.now()}_${Math.random()}`,
                url: attachment.url,
                name: `${machine.model} - ${attachment.name}`,
                type: 'attachment',
                source: 'machine',
                created_at: machine.created_at
              });
            });
          }
        });
      }
    }

    // 按创建时间排序
    mediaFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 应用分页
    const paginatedFiles = mediaFiles.slice(offset, offset + limit);

    return NextResponse.json({
      files: paginatedFiles,
      total: mediaFiles.length,
      hasMore: offset + limit < mediaFiles.length
    });

  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 