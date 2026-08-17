export interface StateItem {
  id: string;
  name: string;
  zone: string;
  status: "Active" | "Inactive";
}

export interface CityItem {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  status: "Active" | "Inactive";
}

export const initialStates: StateItem[] = [
  { id: "state-mh", name: "Maharashtra", zone: "West", status: "Active" },
  { id: "state-dl", name: "Delhi", zone: "North", status: "Active" },
  { id: "state-ka", name: "Karnataka", zone: "South", status: "Active" },
  { id: "state-tn", name: "Tamil Nadu", zone: "South", status: "Active" },
  { id: "state-gj", name: "Gujarat", zone: "West", status: "Active" },
  { id: "state-ts", name: "Telangana", zone: "South", status: "Active" },
  { id: "state-wb", name: "West Bengal", zone: "East", status: "Active" },
  { id: "state-up", name: "Uttar Pradesh", zone: "North", status: "Active" },
];

export const initialCities: CityItem[] = [
  { id: "city-bom", name: "Mumbai", stateId: "state-mh", stateName: "Maharashtra", status: "Active" },
  { id: "city-pnq", name: "Pune", stateId: "state-mh", stateName: "Maharashtra", status: "Active" },
  { id: "city-del", name: "New Delhi", stateId: "state-dl", stateName: "Delhi", status: "Active" },
  { id: "city-blr", name: "Bengaluru", stateId: "state-ka", stateName: "Karnataka", status: "Active" },
  { id: "city-maa", name: "Chennai", stateId: "state-tn", stateName: "Tamil Nadu", status: "Active" },
  { id: "city-hyd", name: "Hyderabad", stateId: "state-ts", stateName: "Telangana", status: "Active" },
  { id: "city-amd", name: "Ahmedabad", stateId: "state-gj", stateName: "Gujarat", status: "Active" },
  { id: "city-ccu", name: "Kolkata", stateId: "state-wb", stateName: "West Bengal", status: "Active" },
];

let statesList: StateItem[] = [...initialStates];
let citiesList: CityItem[] = [...initialCities];

export function getStates(): StateItem[] {
  return statesList;
}

export function addState(newState: Omit<StateItem, "id">): StateItem {
  const id = `state-${newState.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
  const item: StateItem = { id, ...newState };
  statesList.push(item);
  return item;
}

export function getCities(): CityItem[] {
  return citiesList;
}

export function addCity(newCity: Omit<CityItem, "id">): CityItem {
  const id = `city-${newCity.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
  const item: CityItem = { id, ...newCity };
  citiesList.push(item);
  return item;
}
