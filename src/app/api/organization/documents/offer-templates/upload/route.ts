import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { addOfferTemplate } from '@/app/organization/mock/offerTemplates';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const formData = await req.formData();

    const backendUrl = getBackendUrl('/api/organization/documents/offer-templates/upload');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for POST offer-templates/upload, using fallback mock handler:', err);
    }

    const name = (formData.get('name') as string) || 'Uploaded Offer Template';
    const category = (formData.get('category') as any) || 'Standard';
    const description = (formData.get('description') as string) || '';
    const noticePeriodDays = Number(formData.get('noticePeriodDays')) || 30;
    const validityDays = Number(formData.get('validityDays')) || 15;
    const probationMonths = Number(formData.get('probationMonths')) || 6;

    const created = addOfferTemplate({
      name,
      category,
      description,
      noticePeriodDays,
      validityDays,
      probationMonths,
      isDefault: false,
      terms: ['Uploaded DOCX Template file attached.'],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Offer template uploaded successfully.',
        data: created,
        results: [created],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading offer template:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
