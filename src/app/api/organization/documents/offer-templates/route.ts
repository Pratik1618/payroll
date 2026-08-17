import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { getOfferTemplates, addOfferTemplate } from '@/app/organization/mock/offerTemplates';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const backendUrl = getBackendUrl('/api/organization/documents/offer-templates');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for GET offer-templates, using fallback mock data:', err);
    }

    const items = getOfferTemplates();

    return NextResponse.json(
      {
        success: true,
        results: items,
        data: items,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching offer templates:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const body = await req.json();

    const backendUrl = getBackendUrl('/api/organization/documents/offer-templates');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for POST offer-templates, using fallback mock creator:', err);
    }

    // Fallback mock template creation
    const created = addOfferTemplate({
      name: body.name || 'Custom Template',
      category: body.category || 'Custom',
      description: body.description || '',
      noticePeriodDays: body.noticePeriodDays || 30,
      validityDays: body.validityDays || 15,
      probationMonths: body.probationMonths || 6,
      isDefault: body.isDefault || false,
      terms: body.terms || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Offer template created successfully.',
        data: created,
        results: [created],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating offer template:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
