// Static mall data with images, locations, and areas
export interface MallData {
  slug: string;
  name: string;
  location: string;
  area: string;
  diningCount: number;
  imageUrl: string;
  imageAlt: string;
}

export const MALL_AREAS = [
  { value: "all", label: "All Areas" },
  { value: "central", label: "Central" },
  { value: "north", label: "North" },
  { value: "northeast", label: "Northeast" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "southwest", label: "Southwest" },
  { value: "central-west", label: "Central West" },
] as const;

export type MallAreaValue = (typeof MALL_AREAS)[number]["value"];

// Mall images synced from WordPress to Supabase Storage
export const MALLS_DATA: MallData[] = [
  {
    slug: "suntec-city",
    name: "Suntec City",
    location: "City Hall",
    area: "central",
    diningCount: 120,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/suntec-city.jpg",
    imageAlt:
      "Suntec City, in Singapore's Marina Centre, is a vast complex with five office towers and a shopping mall with over 360 stores.",
  },
  {
    slug: "vivocity",
    name: "VivoCity",
    location: "HarbourFront",
    area: "southwest",
    diningCount: 140,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/vivocity.jpg",
    imageAlt: "VivoCity - Singapore's Largest Shopping Mall",
  },
  {
    slug: "plaza-singapura",
    name: "Plaza Singapura",
    location: "Dhoby Ghaut",
    area: "central",
    diningCount: 80,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/plaza-singapura.jpg",
    imageAlt: "Plaza Singapura - Shopping Mall at Dhoby Ghaut",
  },
  {
    slug: "marina-bay-sands",
    name: "Marina Bay Sands",
    location: "Marina Bay",
    area: "central",
    diningCount: 90,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/marina-bay-sands.jpg",
    imageAlt: "Marina Bay Sands Shopping Mall",
  },
  {
    slug: "velocity-novena-square",
    name: "Velocity Novena Square",
    location: "Novena",
    area: "central",
    diningCount: 45,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/velocity-novena-square.jpg",
    imageAlt: "Velocity Novena Square",
  },
  {
    slug: "united-square",
    name: "United Square",
    location: "Novena",
    area: "central",
    diningCount: 35,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/united-square.jpg",
    imageAlt: "United Square Shopping Mall",
  },
  {
    slug: "woodleigh-mall",
    name: "The Woodleigh Mall",
    location: "Woodleigh",
    area: "central",
    diningCount: 30,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/woodleigh-mall.jpg",
    imageAlt:
      "The Woodleigh Mall is a vibrant, three-storey shopping complex nestled amidst the Bidadari Estate in Singapore.",
  },
  {
    slug: "junction-8",
    name: "Junction 8",
    location: "Bishan",
    area: "central",
    diningCount: 50,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/junction-8.jpg",
    imageAlt: "Junction 8 Shopping Centre",
  },
  {
    slug: "city-square-mall",
    name: "City Square Mall",
    location: "Little India",
    area: "central",
    diningCount: 55,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/city-square-mall.jpg",
    imageAlt: "City Square Mall",
  },
  {
    slug: "amk-hub",
    name: "AMK Hub",
    location: "Ang Mo Kio",
    area: "north",
    diningCount: 60,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/amk-hub.jpg",
    imageAlt: "AMK Hub Shopping Mall",
  },
  {
    slug: "causeway-point",
    name: "Causeway Point",
    location: "Woodlands",
    area: "north",
    diningCount: 70,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/causeway-point.jpg",
    imageAlt: "Causeway Point Shopping Centre",
  },
  {
    slug: "nex",
    name: "NEX",
    location: "Serangoon",
    area: "northeast",
    diningCount: 85,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/nex.jpg",
    imageAlt: "NEX Shopping Mall",
  },
  {
    slug: "bedok-mall",
    name: "Bedok Mall",
    location: "Bedok",
    area: "east",
    diningCount: 55,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/bedok-mall.jpg",
    imageAlt: "Bedok Mall",
  },
  {
    slug: "hougang-mall",
    name: "Hougang Mall",
    location: "Hougang",
    area: "northeast",
    diningCount: 40,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/hougang-mall.jpg",
    imageAlt: "Hougang Mall",
  },
  {
    slug: "tampines-mall",
    name: "Tampines Mall",
    location: "Tampines",
    area: "east",
    diningCount: 75,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/tampines-mall.jpg",
    imageAlt: "Tampines Mall",
  },
  {
    slug: "jewel",
    name: "Jewel Changi",
    location: "Changi",
    area: "east",
    diningCount: 110,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/jewel.jpg",
    imageAlt: "Jewel Changi Airport",
  },
  {
    slug: "imm",
    name: "IMM",
    location: "Jurong East",
    area: "west",
    diningCount: 65,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/imm.jpg",
    imageAlt: "IMM Shopping Mall",
  },
  {
    slug: "jem",
    name: "JEM",
    location: "Jurong East",
    area: "west",
    diningCount: 95,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/jem.jpg",
    imageAlt: "JEM Shopping Mall",
  },
  {
    slug: "aperia-mall",
    name: "Aperia Mall",
    location: "Lavender",
    area: "central",
    diningCount: 25,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/aperia-mall.jpg",
    imageAlt: "Aperia Mall",
  },
];

// Get mall data by slug
export function getMallDataBySlug(slug: string): MallData | undefined {
  return MALLS_DATA.find((mall) => mall.slug === slug);
}

// Get all mall names for search suggestions
export function getMallSearchSuggestions(): string[] {
  return MALLS_DATA.map((mall) => mall.name);
}
