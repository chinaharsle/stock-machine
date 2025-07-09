import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');

    if (!model) {
      return NextResponse.json(
        { error: 'Product model is required' },
        { status: 400 }
      );
    }

    // 使用服务器端客户端来查询产品信息
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('machines')
      .select('model, specifications, tooling_drawing_url, image_urls')
      .eq('model', model)
      .single();

    if (error) {
      console.error('Error fetching machine by model:', error);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        model: data.model,
        specifications: data.specifications,
        toolingDrawing: data.tooling_drawing_url,
        images: data.image_urls
      }
    });

  } catch (error) {
    console.error('Error in machines by-model API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 