import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { deleteOfferLetter } from '@/app/organization/mock/offerLetters';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;

    const backendUrl = getBackendUrl(`/api/organization/documents/offer-letters/${encodeURIComponent(id)}`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for DELETE offer letter, using fallback mock handler:', err);
    }

    // Fallback mock delete
    deleteOfferLetter(id);

    return NextResponse.json(
      {
        success: true,
        message: `Offer letter '${id}' deleted successfully.`,
        data: { deletedOfferId: id },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting offer letter:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
