import { withBasePath } from '@/lib/base-path';
import { StateItem, CityItem } from '../mock/statesAndCities';
import { SalaryComponentMasterItem } from '../mock/salaryComponentsMaster';
import { BranchMasterItem } from '../mock/branches';
import { OrganizationNode } from '../mock/organization';
import { Employee } from '../mock/employees';

export async function fetchStates(zone?: string): Promise<StateItem[]> {
  try {
    const query = zone ? `?zone=${encodeURIComponent(zone)}` : '';
    const res = await fetch(withBasePath(`/api/masters/states${query}`), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch states: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];
    return list;
  } catch (error) {
    console.error('fetchStates error:', error);
    return [];
  }
}

export async function createNextState(payload: { name: string; zone: string; status: 'Active' | 'Inactive' }): Promise<StateItem | null> {
  try {
    const res = await fetch(withBasePath('/api/masters/states'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create state: ${res.statusText}`);
    }

    const json = await res.json();
    const createdObj = json.data || json.result || (Array.isArray(json.results) ? json.results[0] : null) || (json.id ? json : null);
    if (createdObj) return createdObj;
    if (json.success) return { id: `state-${payload.name.toLowerCase()}`, ...payload };
    return null;
  } catch (error) {
    console.error('createNextState error:', error);
    return null;
  }
}

export async function fetchCities(stateId?: string): Promise<CityItem[]> {
  try {
    const query = stateId ? `?stateId=${encodeURIComponent(stateId)}` : '';
    const res = await fetch(withBasePath(`/api/masters/cities${query}`), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch cities: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];
    return list;
  } catch (error) {
    console.error('fetchCities error:', error);
    return [];
  }
}

export async function createNextCity(payload: { stateId: string; name: string; status: 'Active' | 'Inactive'; stateName?: string }): Promise<CityItem | null> {
  try {
    const res = await fetch(withBasePath('/api/masters/cities'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create city: ${res.statusText}`);
    }

    const json = await res.json();
    const createdObj = json.data || json.result || (Array.isArray(json.results) ? json.results[0] : null) || (json.id ? json : null);
    if (createdObj) return createdObj;
    if (json.success) return { id: `city-${payload.name.toLowerCase()}`, stateName: payload.stateName || '', ...payload };
    return null;
  } catch (error) {
    console.error('createNextCity error:', error);
    return null;
  }
}

export async function fetchDesignations(): Promise<string[]> {
  try {
    const res = await fetch(withBasePath('/api/masters/designations'), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch designations: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list.map((item: any) => (typeof item === 'string' ? item : item.title || item.name || ''));
  } catch (error) {
    console.error('fetchDesignations error:', error);
    return [];
  }
}

export async function createNextDesignation(title: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath('/api/masters/designations'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, status: 'Active' }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create designation: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('createNextDesignation error:', error);
    return false;
  }
}

export async function removeDesignation(title: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/masters/designations/${encodeURIComponent(title)}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete designation: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('removeDesignation error:', error);
    return false;
  }
}

export async function fetchSalaryComponents(category?: string, status?: string): Promise<SalaryComponentMasterItem[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(withBasePath(`/api/masters/salary-components${queryString}`), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch salary components: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (error) {
    console.error('fetchSalaryComponents error:', error);
    return [];
  }
}

export async function createSalaryComponent(payload: Omit<SalaryComponentMasterItem, 'id'>): Promise<SalaryComponentMasterItem | null> {
  try {
    const res = await fetch(withBasePath('/api/masters/salary-components'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create salary component: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.result || json.results?.[0] || null;
  } catch (error) {
    console.error('createSalaryComponent error:', error);
    return null;
  }
}

export async function updateSalaryComponentApi(id: string, payload: Partial<SalaryComponentMasterItem>): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/masters/salary-components/${encodeURIComponent(id)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update salary component: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('updateSalaryComponentApi error:', error);
    return false;
  }
}

export async function deleteSalaryComponentApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/masters/salary-components/${encodeURIComponent(id)}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete salary component: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('deleteSalaryComponentApi error:', error);
    return false;
  }
}

// ---- Branches Master (physical office locations - code/name/lat/long only,
// independent of the department tree; distinct from the unrelated
// Module 12 `/api/branches` operation-branch lookup used elsewhere) ----

export async function fetchBranchesMaster(): Promise<BranchMasterItem[]> {
  try {
    const res = await fetch(withBasePath('/api/masters/branches'), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch branches: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (error) {
    console.error('fetchBranchesMaster error:', error);
    return [];
  }
}

// The backend returns { errors: [{ errorMessage, ... }] } on failure -
// surface that specific reason (e.g. "Branch code 'X' already exists")
// instead of a generic "Failed to ..." toast that hides why it failed.
function extractApiErrorMessage(json: any, fallback: string): string {
  return json?.errors?.[0]?.errorMessage || fallback;
}

export async function createBranch(
  payload: { code: string; name: string; latitude?: number; longitude?: number }
): Promise<{ data: BranchMasterItem | null; error?: string }> {
  try {
    const res = await fetch(withBasePath('/api/masters/branches'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: extractApiErrorMessage(json, `Failed to create branch: ${res.statusText}`) };
    }

    return { data: json.data || json.result || json.results?.[0] || null };
  } catch (error) {
    console.error('createBranch error:', error);
    return { data: null, error: 'Network error while creating branch.' };
  }
}

export async function updateBranchApi(
  id: string,
  payload: Partial<{ code: string; name: string; latitude: number; longitude: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(withBasePath(`/api/masters/branches/${encodeURIComponent(id)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: extractApiErrorMessage(json, `Failed to update branch: ${res.statusText}`) };
    }

    return { success: json.success !== false };
  } catch (error) {
    console.error('updateBranchApi error:', error);
    return { success: false, error: 'Network error while updating branch.' };
  }
}

export async function deleteBranchApi(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(withBasePath(`/api/masters/branches/${encodeURIComponent(id)}`), {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: extractApiErrorMessage(json, `Failed to delete branch: ${res.statusText}`) };
    }

    return { success: json.success !== false };
  } catch (error) {
    console.error('deleteBranchApi error:', error);
    return { success: false, error: 'Network error while deleting branch.' };
  }
}

export async function fetchOrgTree(): Promise<OrganizationNode[]> {
  try {
    const res = await fetch(withBasePath('/api/organization/tree'), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch org tree: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return buildHierarchicalTree(list);
  } catch (error) {
    console.error('fetchOrgTree error:', error);
    return [];
  }
}

function buildHierarchicalTree(rawList: any[]): OrganizationNode[] {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  // Filter out top company node if it exists in raw array to re-build clean hierarchy
  const cleanList = rawList.filter((n) => n.id !== 'company' && n.name !== 'Departments');
  if (cleanList.length === 0) return rawList;

  const map = new Map<string, OrganizationNode>();
  const rootChildren: OrganizationNode[] = [];

  rawList.forEach((item) => {
    const id = String(item.id || item.deptId || item.name || '').trim();
    if (!id) return;

    const node: OrganizationNode = {
      id: id,
      name: item.name || '',
      head: item.head || item.departmentHead || 'TBD',
      parentId: item.parentId || item.parentDepartmentId || 'company',
      description: item.description || '',
      employeeCount: item.employeeCount || 0,
      monthlyPayroll: item.monthlyPayroll || 0,
      employerCost: item.employerCost || 0,
      activeManagers: item.activeManagers || 0,
      coveredZones: item.coveredZones || [],
      designationQuantities: item.designationQuantities || [],
      latitude: item.latitude ?? undefined,
      longitude: item.longitude ?? undefined,
      geofenceRadiusMeters: item.geofenceRadiusMeters ?? undefined,
      children: Array.isArray(item.children) ? [...item.children] : [],
    };
    map.set(id, node);
    map.set(node.name.toLowerCase(), node);
  });

  // Alias lookup map for parent search
  const findParent = (pId: string): OrganizationNode | undefined => {
    if (!pId) return undefined;
    if (map.has(pId)) return map.get(pId);
    const lower = pId.toLowerCase();
    if (map.has(lower)) return map.get(lower);

    // Common parent aliases
    for (const [key, node] of map.entries()) {
      const nLower = node.name.toLowerCase();
      if (
        (lower === 'ops' && nLower.includes('operation')) ||
        (lower === 'hr' && nLower.includes('hr')) ||
        (lower === 'fin' && (nLower.includes('finance') || nLower.includes('account'))) ||
        (lower === 'mkt' && (nLower.includes('market') || nLower.includes('commercial')))
      ) {
        return node;
      }
    }
    return undefined;
  };

  const processed = new Set<string>();

  map.forEach((node) => {
    if (processed.has(node.id)) return;
    processed.add(node.id);

    const parentId = node.parentId;
    const isRootParent = !parentId || parentId === 'company' || parentId === 'root' || parentId === 'null';
    const parentNode = !isRootParent ? findParent(parentId) : undefined;

    if (parentNode && parentNode.id !== node.id) {
      parentNode.children = parentNode.children || [];
      if (!parentNode.children.some((c) => c.id === node.id)) {
        parentNode.children.push(node);
      }
    } else {
      rootChildren.push(node);
    }
  });

  const rootCompanyNode: OrganizationNode = {
    id: 'company',
    name: 'Departments',
    head: 'CEO',
    employeeCount: rootChildren.reduce((acc, c) => acc + (c.employeeCount || 0), 0),
    monthlyPayroll: rootChildren.reduce((acc, c) => acc + (c.monthlyPayroll || 0), 0),
    employerCost: rootChildren.reduce((acc, c) => acc + (c.employerCost || 0), 0),
    activeManagers: rootChildren.reduce((acc, c) => acc + (c.activeManagers || 0), 0),
    description: 'The global organization structure.',
    children: rootChildren,
  };

  return [rootCompanyNode];
}

export async function createDepartmentApi(payload: {
  name: string;
  head?: string;
  parentId?: string;
  description?: string;
  coveredZones?: string[];
  designationQuantities?: { designation: string; quantity: number }[];
}): Promise<OrganizationNode | null> {
  try {
    const res = await fetch(withBasePath('/api/organization/departments'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create department: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.result || json.results?.[0] || null;
  } catch (error) {
    console.error('createDepartmentApi error:', error);
    return null;
  }
}

export async function updateDesignationQuantitiesApi(
  deptId: string,
  designationQuantities: { designation: string; quantity: number }[]
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/departments/${encodeURIComponent(deptId)}/designations`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ designationQuantities }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update designation quantities: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('updateDesignationQuantitiesApi error:', error);
    return false;
  }
}

export async function updateCoveredZonesApi(
  deptId: string,
  coveredZones: string[]
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/departments/${encodeURIComponent(deptId)}/zones`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coveredZones }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update covered zones: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('updateCoveredZonesApi error:', error);
    return false;
  }
}

export async function updateGeofenceApi(
  deptId: string,
  payload: { latitude: number; longitude: number; radiusMeters: number }
): Promise<{ latitude: number; longitude: number; radiusMeters: number } | null> {
  try {
    const res = await fetch(withBasePath(`/api/organization/departments/${encodeURIComponent(deptId)}/geofence`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update geofence: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.results || null;
  } catch (error) {
    console.error('updateGeofenceApi error:', error);
    return null;
  }
}

export async function clearGeofenceApi(deptId: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/departments/${encodeURIComponent(deptId)}/geofence`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to clear geofence: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('clearGeofenceApi error:', error);
    return false;
  }
}

export type DepartmentDependenciesResult = {
  departmentId: string;
  departmentName: string;
  assignedEmployeesCount: number;
  childDepartmentsCount: number;
  childDepartmentNames: string[];
};

export async function inspectDepartmentDependenciesApi(deptId: string): Promise<DepartmentDependenciesResult | null> {
  try {
    const res = await fetch(withBasePath(`/api/organization/departments/${encodeURIComponent(deptId)}/dependencies`), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to inspect department dependencies: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.result || null;
  } catch (error) {
    console.error('inspectDepartmentDependenciesApi error:', error);
    return null;
  }
}

export async function safeDeleteDepartmentApi(
  deptId: string,
  payload: {
    confirmName: string;
    employeeAction?: 'reassign' | 'unassign';
    targetDeptId?: string;
  }
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/departments/${encodeURIComponent(deptId)}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete department: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('safeDeleteDepartmentApi error:', error);
    return false;
  }
}

export async function fetchEmployeesApi(nodeId?: string, status?: string): Promise<Employee[]> {
  try {
    const params = new URLSearchParams();
    if (nodeId) params.append('nodeId', nodeId);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(withBasePath(`/api/organization/employees${queryString}`), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch employees: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (error) {
    console.error('fetchEmployeesApi error:', error);
    return [];
  }
}

export async function editEmployeeApi(
  employeeId: string,
  payload: Partial<Employee>
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/employees/${encodeURIComponent(employeeId)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to edit employee: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('editEmployeeApi error:', error);
    return false;
  }
}

export async function transferEmployeeApi(
  employeeId: string,
  payload: {
    targetDepartmentId: string;
    targetSubDepartmentId?: string | null;
    targetZone?: string | null;
  }
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/employees/${encodeURIComponent(employeeId)}/transfer`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to transfer employee: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('transferEmployeeApi error:', error);
    return false;
  }
}

export type UnassignedEmployeeItem = {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  status: string;
};

export async function fetchUnassignedEmployeesApi(): Promise<UnassignedEmployeeItem[]> {
  try {
    const res = await fetch(withBasePath('/api/organization/employees/unassigned'), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch unassigned employees pool: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (error) {
    console.error('fetchUnassignedEmployeesApi error:', error);
    return [];
  }
}

export async function assignEmployeeApi(
  employeeId: string,
  payload: {
    departmentId: string;
    subDepartmentId?: string | null;
    zoneId?: string | null;
    reportingManager?: string;
    monthlySalary?: number;
    branchId?: string | null;
  }
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/employees/${encodeURIComponent(employeeId)}/assign`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to assign employee: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('assignEmployeeApi error:', error);
    return false;
  }
}

export async function unassignEmployeeApi(employeeId: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/employees/${encodeURIComponent(employeeId)}/unassign`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to unassign employee: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('unassignEmployeeApi error:', error);
    return false;
  }
}

export async function fetchEmployeeSalaryStructureApi(employeeId: string): Promise<any[] | null> {
  try {
    const res = await fetch(withBasePath(`/api/organization/employees/${encodeURIComponent(employeeId)}/salary-structure`));

    if (!res.ok) {
      throw new Error(`Failed to fetch salary structure: ${res.statusText}`);
    }

    const json = await res.json();
    return json.results?.salaryComponents ?? null;
  } catch (error) {
    console.error('fetchEmployeeSalaryStructureApi error:', error);
    return null;
  }
}

export async function updateEmployeeSalaryStructureApi(
  employeeId: string,
  salaryComponents: any[]
): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/employees/${encodeURIComponent(employeeId)}/salary-structure`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ salaryComponents }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update salary structure: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('updateEmployeeSalaryStructureApi error:', error);
    return false;
  }
}

export async function createOfferLetterApi(payload: {
  candidateName: string;
  candidateEmail: string;
  designation: string;
  department: string;
  ctc: number;
  salaryComponents?: any[];
}): Promise<any | null> {
  try {
    const res = await fetch(withBasePath('/api/organization/documents/offer-letters'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create offer letter: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.result || json.results?.[0] || null;
  } catch (error) {
    console.error('createOfferLetterApi error:', error);
    return null;
  }
}

export async function updateOfferStatusApi(offerId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/documents/offer-letters/${encodeURIComponent(offerId)}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update offer letter status: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('updateOfferStatusApi error:', error);
    return false;
  }
}

export async function fetchOfferLettersApi(status?: string, departmentId?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (departmentId && departmentId !== 'ALL') params.append('departmentId', departmentId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(withBasePath(`/api/organization/documents/offer-letters${queryString}`), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch offer letters: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results?.data)
      ? json.results.data
      : Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (error) {
    console.error('fetchOfferLettersApi error:', error);
    return [];
  }
}

export async function deleteOfferLetterApi(offerId: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/documents/offer-letters/${encodeURIComponent(offerId)}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete offer letter: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('deleteOfferLetterApi error:', error);
    return false;
  }
}

export async function createAppointmentLetterApi(payload: {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  designation: string;
  department: string;
  joiningDate: string;
  monthlySalary: number;
}): Promise<any | null> {
  try {
    const res = await fetch(withBasePath('/api/organization/documents/appointment-letters'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create appointment letter: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.result || json.results?.[0] || null;
  } catch (error) {
    console.error('createAppointmentLetterApi error:', error);
    return null;
  }
}

export async function fetchOfferTemplatesApi(): Promise<any[]> {
  try {
    const res = await fetch(withBasePath('/api/organization/documents/offer-templates'), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch offer templates: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (error) {
    console.error('fetchOfferTemplatesApi error:', error);
    return [];
  }
}

export async function uploadOfferTemplateApi(formData: FormData): Promise<any | null> {
  try {
    const res = await fetch(withBasePath('/api/organization/documents/offer-templates/upload'), {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload offer template: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json.result || json.results?.[0] || null;
  } catch (error) {
    console.error('uploadOfferTemplateApi error:', error);
    return null;
  }
}

export function getOfferTemplateFileDownloadUrl(templateId: string): string {
  return withBasePath(`/api/organization/documents/offer-templates/${encodeURIComponent(templateId)}/file`);
}

export async function updateOfferTemplateApi(templateId: string, payload: any): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/documents/offer-templates/${encodeURIComponent(templateId)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update offer template: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('updateOfferTemplateApi error:', error);
    return false;
  }
}

export async function deleteOfferTemplateMasterApi(templateId: string): Promise<boolean> {
  try {
    const res = await fetch(withBasePath(`/api/organization/documents/offer-templates/${encodeURIComponent(templateId)}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete offer template: ${res.statusText}`);
    }

    const json = await res.json();
    return json.success !== false;
  } catch (error) {
    console.error('deleteOfferTemplateMasterApi error:', error);
    return false;
  }
}
