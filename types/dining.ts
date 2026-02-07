export type SingaporeArea =
  | "all"
  | "central"
  | "east"
  | "west"
  | "north"
  | "north-east"
  | "south";

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  tags: string[];
  image: string;
  description: string;
  area: SingaporeArea;
  tag?: string;
  address: string;
  phone: string;
  hours: string;
  website: string;
}

export interface DiningDeal {
  id: string;
  badge: string;
  title: string;
  duration: string;
  description: string;
  code: string;
}

export interface DiningCategory {
  name: string;
  image: string;
  url: string;
}

export interface AreaFilter {
  value: SingaporeArea;
  label: string;
  tooltip: string;
}

export const AREA_FILTERS: AreaFilter[] = [
  { value: "all", label: "All Regions", tooltip: "All areas in Singapore" },
  {
    value: "central",
    label: "Central",
    tooltip:
      "Districts 01-08, 09-13 (Raffles Place, Orchard, River Valley, Chinatown)",
  },
  {
    value: "east",
    label: "East",
    tooltip: "Districts 14-18 (Geylang, Katong, Bedok, Tampines, Pasir Ris)",
  },
  {
    value: "west",
    label: "West",
    tooltip: "Districts 22-24 (Jurong, Boon Lay, Choa Chu Kang)",
  },
  {
    value: "north",
    label: "North",
    tooltip: "Districts 25-28 (Kranji, Woodgrove, Yishun, Sembawang, Seletar)",
  },
  {
    value: "north-east",
    label: "North-East",
    tooltip: "Districts 19-20, 28 (Serangoon, Hougang, Punggol, Seletar)",
  },
  {
    value: "south",
    label: "South",
    tooltip: "Districts 01-02 (Raffles Place, Tanjong Pagar, Marina Bay)",
  },
];
