export type Venue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mapsQuery?: string;
  neighborhoods: string[];
};

export const VENUES: Venue[] = [
  {
    id: "cdmx-spot-1",
    name: "Plaza Rio de Janeiro",
    lat: 19.4216,
    lng: -99.1609,
    mapsQuery: "Plaza Rio de Janeiro, Roma Norte",
    neighborhoods: ["Roma", "Juárez"]
  },
  {
    id: "cdmx-spot-2",
    name: "Parque México",
    lat: 19.411,
    lng: -99.171,
    mapsQuery: "Parque Mexico, Condesa",
    neighborhoods: ["Condesa", "Roma"]
  },
  {
    id: "cdmx-spot-3",
    name: "Plaza Luis Cabrera",
    lat: 19.4202,
    lng: -99.1619,
    mapsQuery: "Plaza Luis Cabrera, Roma Norte",
    neighborhoods: ["Roma"]
  }
];

export const NEIGHBORHOODS = ["Roma", "Condesa", "Juárez", "Centro"] as const;

export const VIBES = ["Chill", "Lively", "Curious", "Bold"] as const;

