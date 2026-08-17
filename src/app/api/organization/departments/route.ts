import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { addDepartment, OrganizationNode } from '@/app/organization/mock/organization';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const body = await req.json();

    const backendUrl = getBackendUrl('/api/organization/departments');
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
      console.warn('Backend server fetch failed for POST /api/organization/departments, using fallback mock creator:', err);
    }

    // Fallback Mock department creation
    addDepartment(
      {
        name: body.name || '',
        head: body.head || 'TBD',
        description: body.description || '',
        coveredZones: body.coveredZones || [],
        designationQuantities: body.designationQuantities || [],
      },
      body.parentId || 'company'
    );

    const newId = `dept-${(body.name || 'new').toLowerCase().replace(/\s+/g, '_')}-${Date.now().toString(36)}`;
    const newDeptNode: OrganizationNode = {
      id: newId,
      name: body.name || '',
      head: body.head || 'TBD',
      parentId: body.parentId || 'company',
      description: body.description || '',
      coveredZones: body.coveredZones || [],
      designationQuantities: body.designationQuantities || [],
      employeeCount: 0,
      monthlyPayroll: 0,
      employerCost: 0,
      activeManagers: 0,
      children: [],
    };

    return NextResponse.json(
      {
        success: true,
        message: `Department '${newDeptNode.name}' created successfully.`,
        data: newDeptNode,
        results: [newDeptNode],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
