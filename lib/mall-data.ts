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
      "https://lh3.googleusercontent.com/place-photos/AEkURDwIGhH6IkHMhE80uXWE2rMdu7k-owg3Q5khwR4fuqv706AxMtLFYiME_7__eWlUcBtci0xd8nMNIAsh38h5noOMLltY-Sb99NWlOBcbc59Dns-tjldZp_U3QxpyE8ZEyjKqs6IFAOFSFmuj5TkU5-t3qQ=s4800-w4800",
    imageAlt: "Marina Bay Sands Shopping Mall",
  },
  {
    slug: "velocity-novena-square",
    name: "Velocity Novena Square",
    location: "Novena",
    area: "central",
    diningCount: 45,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDxZDdmYIEbp-ZUIS-nlm36sRbqOFHc3Krp2D529m5zv5VTPeI1FRQLHUHLqOBHV-FK5hDBi6w3PrfIXkbSmp19mZeS0s238QJrwuQfFTf5fWzrxLkh4yMFr3-ZxGQkTXOLhxvd9Ie85LEfG=s4800-w1280",
    imageAlt: "Velocity Novena Square",
  },
  {
    slug: "united-square",
    name: "United Square",
    location: "Novena",
    area: "central",
    diningCount: 35,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDx5TOvbzWymD2MZfikCOLxf--JA0JkTVb8G2ZmwoeAUVLeEb7UaVWhYIUdQQNn8zAV-iMEXKpkF01qZZNLJMYP8ldlIpbzZGlqmMV9Mwi73j8s0EBbdAdfE1LgdZX5rgQ-InehHmWCjST1u=s4800-w3024",
    imageAlt: "United Square Shopping Mall",
  },
  {
    slug: "woodleigh-mall",
    name: "The Woodleigh Mall",
    location: "Woodleigh",
    area: "central",
    diningCount: 30,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDzwgtRYwOnyaw4I0LxEdW4FqczjFJTwBwIFHtcr0KO4aPJFHLXmhGfF06hDQbIV2m38QWhWcQ0im_PHZBSyyjgkIukuJ3tk42AxyR0OkFnEN2qACMsPzqHhOdiEC_eijtt5YO6Jz8kHmbHsD7Q=s4800-w4032",
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
      "https://lh3.googleusercontent.com/place-photos/AEkURDw9PxfidJuPvcQnQRazx5bVPEAXogqW62Q_XKgwkqnBsG7mWOVxEvmHVXZ2fI9Ua3CqxA09Ag6UF4OD2to-Wd23xkq9mWXWyeECBE1YsHGp2DYuJem4cN0zf6B26UZlyFPidQIEylgWDpBNmVc=s4800-w1097",
    imageAlt: "Junction 8 Shopping Centre",
  },
  {
    slug: "city-square-mall",
    name: "City Square Mall",
    location: "Little India",
    area: "central",
    diningCount: 55,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDx4z4G5FZhkEUcVXt5BdNR1rEBy3hD3b783XZwALNTFaI1ebnTgsXfB03-W2psNVVX5LYxmGoV17Dqmu8wE9kEiykwzj3gMtuxtRhg_bI5SIlje6bcU-AyYpDrrymsKpp4ZApf7BvxCMeDNE8CajUjG=s4800-w4800",
    imageAlt: "City Square Mall",
  },
  {
    slug: "amk-hub",
    name: "AMK Hub",
    location: "Ang Mo Kio",
    area: "north",
    diningCount: 60,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDxy3nPjl006rDqAdUREEkzS5ebZIvOPatENOMrjshhrlnBnAnVmt7QHk4X6lzdvanDqw2WTvepi6ceuHkX-kqjxiDRDPizTlClZc2l3Nmwj4LstF889rLWiLUHBfQzKPXZzwkAeAdihXMjsiA=s4800-w1280",
    imageAlt: "AMK Hub Shopping Mall",
  },
  {
    slug: "causeway-point",
    name: "Causeway Point",
    location: "Woodlands",
    area: "north",
    diningCount: 70,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDx9QzmUGavUZkkrxXjBdVYPPYTvAK0d4OInYttF0OPABKcQVnGDm9rNzOiFR2acfFA2CrVEgzPvhi9hOtNPnqMKky35ljPRMsuAciCPnH6qxNWBicam9WtQJ98eanvxy6nFn7xr6wN9h_c-Yg=s4800-w4608",
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
      "https://lh3.googleusercontent.com/place-photos/AEkURDwP08x206JPEGZyzh5WjHDbcOv2ayJZxQ7hIq7vExhncHAAH7-noycBaRmglqcNcA1AM0jMZcxOcxK0_fepfdNwgteF3LL66lmdkOBK5GVlPA0zwJJo1BLuc7nyFLfIum43tMWixdkXJtkVOA=s4800-w4032",
    imageAlt: "Bedok Mall",
  },
  {
    slug: "hougang-mall",
    name: "Hougang Mall",
    location: "Hougang",
    area: "northeast",
    diningCount: 40,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDxYRyxN5MS8U0JxZwd60VOOFzu3zPzeC3RpjJc_Ml3TyRX3FsFD_UknRzoVXnys4XcRR1RgAxjniYJYDVjx6GI5i-JskkKxNfk_7NOp35VSZ4SUgYkGxkcDiWzRJ0Hy2B6hieEy2srLjS-Owag=s4800-w4160",
    imageAlt: "Hougang Mall",
  },
  {
    slug: "tampines-mall",
    name: "Tampines Mall",
    location: "Tampines",
    area: "east",
    diningCount: 75,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDyhaKVec7GN1wYX8OWrl9LgzZnj6Bze9y_Dxbq1Idvs78I17qNYFtucwF6ujiT2AO2vOWL6kaD-48H5RxYCeO4XHg9dwA8eZMcwIUUGIEVerokr_kC9ogvDAlMsoUVpqdTDHh9aiPqJlxQDRA=s4800-w4000",
    imageAlt: "Tampines Mall",
  },
  {
    slug: "jewel",
    name: "Jewel Changi",
    location: "Changi",
    area: "east",
    diningCount: 110,
    imageUrl:
      "https://hgdedyrjkywaboalisaw.supabase.co/storage/v1/object/public/hero-images/malls/jewel-changi.jpg",
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
      "https://lh3.googleusercontent.com/place-photos/AEkURDyfFx7lIVjJh1fVUjREw3OyHzYvz5fl_JEAuxtIcW1zY8GEHGqz7T8tasTLUiAGZ506vy7R7VjmXH8nTJe3uJufPJHqQBEysiVGuj3s1nROsCfgFh7LKdTU5lbVnGSBPcGwAwVjmoTt9N3yGxQ=s4800-w4032",
    imageAlt: "JEM Shopping Mall",
  },
  {
    slug: "aperia-mall",
    name: "Aperia Mall",
    location: "Lavender",
    area: "central",
    diningCount: 25,
    imageUrl:
      "https://lh3.googleusercontent.com/place-photos/AEkURDywGBThaDeLsXGBJupfP9j0hr1F05wp0SoMGxj39rD4NH4CU-AN1yYAbVFUOU1cmsz8PumAoK-DdvldsdFc6kq0uaWcP9Ei9sY16nSsQA5PcLF9ypWtiHCOZcHTbXlFNvZ0SiW3Sfvv4TuHj2w=s4800-w4032",
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
