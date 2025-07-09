import { NextRequest, NextResponse } from 'next/server';
import { updateInquiryStatus, deleteInquiry } from '@/lib/supabase/inquiries';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id: inquiryId } = await context.params;

    if (!inquiryId || inquiryId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const success = await updateInquiryStatus(inquiryId, status);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Inquiry updated successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update inquiry' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await context.params;

    if (!inquiryId || inquiryId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const success = await deleteInquiry(inquiryId);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete inquiry' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
} 