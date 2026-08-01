export interface StateItem {
  id: string;
  name: string;
  code: string;
  region: string;
  country: string;
  status: "Active" | "Inactive";
  description?: string;
}

export interface CityItem {
  id: string;
  name: string;
  code: string;
  stateId: string;
  stateName: string;
  category: "Metro" | "Non-Metro" | "Tier 1" | "Tier 2" | "Tier 3";
  status: "Active" | "Inactive";
  description?: string;
}

export const initialStates: StateItem[] = [
  { id: "state-mh", name: "Maharashtra", code: "MH", region: "West", country: "India", status: "Active", description: "Western region state" },
  { id: "state-dl", name: "Delhi", code: "DL", region: "North", country: "India", status: "Active", description: "National Capital Territory" },
  { id: "state-ka", name: "Karnataka", code: "KA", region: "South", country: "India", status: "Active", description: "Southern tech corridor" },
  { id: "state-tn", name: "Tamil Nadu", code: "TN", region: "South", country: "India", status: "Active", description: "Southern industrial hub" },
  { id: "state-gj", name: "Gujarat", code: "GJ", region: "West", country: "India", status: "Active", description: "Western commercial state" },
  { id: "state-ts", name: "Telangana", code: "TS", region: "South", country: "India", status: "Active", description: "Southern IT state" },
  { id: "state-wb", name: "West Bengal", code: "WB", region: "East", country: "India", status: "Active", description: "Eastern region state" },
  { id: "state-up", name: "Uttar Pradesh", code: "UP", region: "North", country: "India", status: "Active", description: "Northern region state" },
];

export const initialCities: CityItem[] = [
  { id: "city-bom", name: "Mumbai", code: "MUM", stateId: "state-mh", stateName: "Maharashtra", category: "Metro", status: "Active", description: "Financial Capital" },
  { id: "city-pnq", name: "Pune", code: "PUN", stateId: "state-mh", stateName: "Maharashtra", category: "Tier 1", status: "Active", description: "IT and Automobile Hub" },
  { id: "city-del", name: "New Delhi", code: "DEL", stateId: "state-dl", stateName: "Delhi", category: "Metro", status: "Active", description: "Capital City" },
  { id: "city-blr", name: "Bengaluru", code: "BLR", stateId: "state-ka", stateName: "Karnataka", category: "Metro", status: "Active", description: "Silicon Valley of India" },
  { id: "city-maa", name: "Chennai", code: "MAA", stateId: "state-tn", stateName: "Tamil Nadu", category: "Metro", status: "Active", description: "Automobile and IT Hub" },
  { id: "city-hyd", name: "Hyderabad", code: "HYD", stateId: "state-ts", stateName: "Telangana", category: "Metro", status: "Active", description: "Cyberabad IT hub" },
  { id: "city-amd", name: "Ahmedabad", code: "AMD", stateId: "state-gj", stateName: "Gujarat", category: "Tier 1", status: "Active", description: "Textile & Trade Center" },
  { id: "city-ccu", name: "Kolkata", code: "CCU", stateId: "state-wb", stateName: "West Bengal", category: "Metro", status: "Active", description: "Cultural Capital" },
];

let statesList: StateItem[] = [...initialStates];
let citiesList: CityItem[] = [...initialCities];

export function getStates(): StateItem[] {
  return statesList;
}

export function addState(newState: Omit<StateItem, "id">): StateItem {
  const id = `state-${newState.code.toLowerCase()}-${Date.now().toString(36)}`;
  const item: StateItem = { id, ...newState };
  statesList.push(item);
  return item;
}

export function getCities(): CityItem[] {
  return citiesList;
}

export function addCity(newCity: Omit<CityItem, "id">): CityItem {
  const id = `city-${newCity.name.toLowerCase().replace(/\s+/g, '_')}-${Date.now().toString(36)}`;
  const item: CityItem = { id, ...newCity };
  citiesList.push(item);
  return item;
}
