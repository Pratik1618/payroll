import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { initialSalaryComponentsMaster, SalaryComponentMasterItem } from '@/app/organization/mock/salaryComponentsMaster';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const backendUrl = getBackendUrl(`/api/masters/salary-components${queryString}`);

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
      console.warn('Backend server fetch failed for /api/masters/salary-components, using fallback mock data:', err);
    }

    let items: SalaryComponentMasterItem[] = initialSalaryComponentsMaster;
    if (category) {
      items = items.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      items = items.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json(
      {
        success: true,
        results: items,
        data: items,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching salary components:', error);
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

    const backendUrl = getBackendUrl('/api/masters/salary-components');
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
      console.warn('Backend server fetch failed for POST /api/masters/salary-components, using fallback mock creator:', err);
    }

    const newId = `comp-${(body.code || 'custom').toLowerCase()}-${Date.now().toString(36)}`;
    const newItem: SalaryComponentMasterItem = {
      id: newId,
      name: body.name || '',
      code: body.code || '',
      category: body.category || 'Earning',
      status: body.status || 'Active',
      description: body.description || '',
    };

    initialSalaryComponentsMaster.push(newItem);

    return NextResponse.json(
      {
        success: true,
        message: `Salary component '${newItem.name}' added successfully.`,
        data: newItem,
        results: [newItem],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding salary component:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
