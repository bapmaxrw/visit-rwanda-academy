import gorilla from "@/assets/volcanoes-gorilla.jpg";
import akagera from "@/assets/akagera-savannah.jpg";
import nyungwe from "@/assets/nyungwe-canopy.jpg";
import kivu from "@/assets/lake-kivu.jpg";
import kigali from "@/assets/kigali-city.jpg";
import culture from "@/assets/culture-intore.jpg";
import bisoke from "@/assets/bisoke-hike.jpg";
import hills from "@/assets/hero-hills.jpg";

export type Category = "National Park" | "Lake & Nature" | "Culture & History" | "Kigali";

export interface Attraction {
  slug: string;
  name: string;
  category: Category;
  province: string;
  district: string;
  image: string;
  short: string;
  description: string;
  coords: [number, number];
  activities: string[];
  bestTime: string;
  duration: string;
  featured?: boolean;
  /** Contacts, fees and hours are only shown once verified by an administrator. */
  verified: boolean;
}

const a = (x: Attraction) => x;

export const attractions: Attraction[] = [
  a({ slug: "volcanoes-national-park", name: "Volcanoes National Park", category: "National Park", province: "Northern", district: "Musanze", image: gorilla, featured: true, verified: false,
    short: "Trek to meet endangered mountain gorillas among the Virunga volcanoes.",
    description: "Set in the bamboo-clad slopes of the Virunga massif, Volcanoes National Park is home to habituated families of mountain gorillas and golden monkeys. Trails climb through montane forest to volcanic summits, crater lakes and the former research base of Dian Fossey.",
    coords: [-1.4833, 29.5333], activities: ["Gorilla trekking", "Golden monkey tracking", "Volcano hiking", "Dian Fossey tomb hike"], bestTime: "June – September, December – February", duration: "2 – 3 days" }),
  a({ slug: "akagera-national-park", name: "Akagera National Park", category: "National Park", province: "Eastern", district: "Kayonza", image: akagera, featured: true, verified: false,
    short: "Rwanda's Big Five savannah of lakes, plains and papyrus swamps.",
    description: "Akagera protects rolling savannah, woodland and a chain of lakes along the Tanzanian border. Game drives and boat safaris reveal lions, rhinos, elephants, buffalo, giraffes, hippos and over 480 bird species.",
    coords: [-1.8833, 30.7167], activities: ["Game drives", "Boat safari on Lake Ihema", "Night drives", "Birdwatching"], bestTime: "June – September", duration: "1 – 2 days" }),
  a({ slug: "nyungwe-national-park", name: "Nyungwe National Park", category: "National Park", province: "Western", district: "Nyamasheke", image: nyungwe, featured: true, verified: false,
    short: "Ancient montane rainforest with chimpanzees and a famous canopy walk.",
    description: "One of Africa's oldest rainforests, Nyungwe shelters 13 primate species including chimpanzees and Ruwenzori colobus, hundreds of birds and orchids, and a suspended canopy walkway high above the valley.",
    coords: [-2.4833, 29.2], activities: ["Chimpanzee trekking", "Canopy walkway", "Waterfall hikes", "Birding"], bestTime: "June – August, December – February", duration: "2 days" }),
  a({ slug: "gishwati-mukura-national-park", name: "Gishwati-Mukura National Park", category: "National Park", province: "Western", district: "Rutsiro", image: hills, verified: false,
    short: "Rwanda's newest park — restored forests, chimps and community trails.",
    description: "Two forest fragments being restored and reconnected, Gishwati-Mukura offers chimpanzee and monkey tracking, waterfalls and community-run experiences in tea country.",
    coords: [-1.8167, 29.3667], activities: ["Primate tracking", "Waterfall walks", "Community tourism"], bestTime: "June – September", duration: "1 day" }),
  a({ slug: "lake-kivu", name: "Lake Kivu", category: "Lake & Nature", province: "Western", district: "Rubavu / Karongi / Rusizi", image: kivu, featured: true, verified: false,
    short: "Sandy beaches, island boat trips and sunsets along the Great Rift.",
    description: "One of Africa's Great Lakes, Kivu stretches along Rwanda's western border. Lakeside towns Rubavu, Karongi and Rusizi offer kayaking, island hopping, coffee tours and the evening song of fishermen.",
    coords: [-2.0, 29.2], activities: ["Kayaking", "Boat trips", "Swimming", "Coffee tours"], bestTime: "Year-round", duration: "2 – 4 days" }),
  a({ slug: "lake-muhazi", name: "Lake Muhazi", category: "Lake & Nature", province: "Eastern", district: "Gatsibo / Rwamagana", image: kivu, verified: false,
    short: "A long, winding lake near Kigali for weekend escapes.", description: "A narrow lake an hour from Kigali, popular for boating, fishing and lakeside lunches.", coords: [-1.85, 30.35], activities: ["Boating", "Fishing", "Birding"], bestTime: "Year-round", duration: "Half day" }),
  a({ slug: "lake-burera", name: "Lake Burera", category: "Lake & Nature", province: "Northern", district: "Burera", image: kivu, verified: false,
    short: "Deep blue twin of Ruhondo framed by volcanoes.", description: "A highland lake dotted with islands beneath the Virunga volcanoes.", coords: [-1.45, 29.75], activities: ["Canoeing", "Island visits"], bestTime: "June – September", duration: "Half day" }),
  a({ slug: "lake-ruhondo", name: "Lake Ruhondo", category: "Lake & Nature", province: "Northern", district: "Musanze", image: kivu, verified: false,
    short: "Tranquil lake with views of the volcano chain.", description: "Connected to Burera by the Rusumo falls, Ruhondo is ideal for relaxing after gorilla trekking.", coords: [-1.5, 29.73], activities: ["Boating", "Hiking"], bestTime: "Year-round", duration: "Half day" }),
  a({ slug: "lake-ihema", name: "Lake Ihema", category: "Lake & Nature", province: "Eastern", district: "Kayonza", image: akagera, verified: false,
    short: "Akagera's largest lake, home to hippos and crocodiles.", description: "Boat safaris on Ihema bring close sightings of hippos, crocodiles and water birds.", coords: [-1.87, 30.8], activities: ["Boat safari", "Birdwatching"], bestTime: "June – September", duration: "2 hours" }),
  a({ slug: "lake-rweru", name: "Lake Rweru", category: "Lake & Nature", province: "Eastern", district: "Bugesera", image: kivu, verified: false,
    short: "A border lake rich in birdlife and papyrus.", description: "Shared with Burundi, Rweru is a quiet birding destination in Bugesera.", coords: [-2.38, 30.33], activities: ["Birding", "Fishing"], bestTime: "Year-round", duration: "Half day" }),
  a({ slug: "mount-bisoke", name: "Mount Bisoke", category: "Lake & Nature", province: "Northern", district: "Musanze", image: bisoke, featured: true, verified: false,
    short: "Day hike to a stunning crater lake at 3,711 m.", description: "A steep but rewarding hike through bamboo and giant lobelia to Bisoke's summit crater lake.", coords: [-1.46, 29.49], activities: ["Hiking", "Crater lake views"], bestTime: "June – September", duration: "6 – 7 hours" }),
  a({ slug: "mount-karisimbi", name: "Mount Karisimbi", category: "Lake & Nature", province: "Northern", district: "Musanze", image: bisoke, verified: false,
    short: "Rwanda's highest peak, a two-day summit expedition.", description: "At 4,507 m, Karisimbi offers an overnight trek with alpine meadows and sweeping Virunga views.", coords: [-1.508, 29.445], activities: ["Overnight trek", "Camping"], bestTime: "June – August", duration: "2 days" }),
  a({ slug: "musanze-caves", name: "Musanze Caves", category: "Lake & Nature", province: "Northern", district: "Musanze", image: bisoke, verified: false,
    short: "Lava tube caves with bats and cathedral-like chambers.", description: "Formed by volcanic eruptions, these caves stretch around 2 km beneath Musanze.", coords: [-1.5, 29.62], activities: ["Guided cave walk"], bestTime: "Year-round", duration: "2 hours" }),
  a({ slug: "canopy-walkway", name: "Nyungwe Canopy Walkway", category: "Lake & Nature", province: "Western", district: "Nyamasheke", image: nyungwe, verified: false,
    short: "Walk above the rainforest treetops.", description: "A suspended bridge high above a forested ravine in Nyungwe.", coords: [-2.47, 29.2], activities: ["Canopy walk", "Forest hike"], bestTime: "June – August", duration: "2 – 3 hours" }),
  a({ slug: "congo-nile-trail", name: "Congo Nile Trail", category: "Lake & Nature", province: "Western", district: "Rubavu – Rusizi", image: kivu, verified: false,
    short: "A multi-day hike or bike route along Lake Kivu.", description: "Following the watershed between the Congo and Nile basins, this trail winds through villages, tea estates and lakeshores.", coords: [-2.1, 29.3], activities: ["Hiking", "Cycling", "Village stays"], bestTime: "June – September", duration: "3 – 10 days" }),
  a({ slug: "kigali-genocide-memorial", name: "Kigali Genocide Memorial", category: "Culture & History", province: "Kigali", district: "Gasabo", image: kigali, featured: true, verified: false,
    short: "A place of remembrance and learning in Gisozi.", description: "The final resting place for more than 250,000 victims of the 1994 Genocide against the Tutsi, with exhibitions on history and peace-building.", coords: [-1.9306, 30.0606], activities: ["Guided visit", "Audio guide", "Gardens of remembrance"], bestTime: "Year-round", duration: "2 – 3 hours" }),
  a({ slug: "kings-palace-museum", name: "King's Palace Museum", category: "Culture & History", province: "Southern", district: "Nyanza", image: culture, verified: false,
    short: "Royal residence with a reconstructed traditional palace and Inyambo cattle.", description: "In Nyanza, the former royal capital, see a reconstructed thatched palace and the long-horned Inyambo cattle.", coords: [-2.35, 29.74], activities: ["Museum tour", "Inyambo cattle"], bestTime: "Year-round", duration: "2 hours" }),
  a({ slug: "ethnographic-museum", name: "Ethnographic Museum", category: "Culture & History", province: "Southern", district: "Huye", image: culture, verified: false,
    short: "Rwanda's finest collection of cultural artifacts.", description: "In Huye, this museum tells Rwanda's story through crafts, tools and traditions.", coords: [-2.58, 29.74], activities: ["Exhibitions", "Dance performances"], bestTime: "Year-round", duration: "2 hours" }),
  a({ slug: "campaign-against-genocide-museum", name: "Campaign Against Genocide Museum", category: "Culture & History", province: "Kigali", district: "Gasabo", image: kigali, verified: false,
    short: "History of the liberation struggle in the Parliament building.", description: "Located at the Parliament, this museum documents the campaign that stopped the 1994 Genocide against the Tutsi.", coords: [-1.95, 30.1], activities: ["Guided tour", "Rooftop view"], bestTime: "Year-round", duration: "1.5 hours" }),
  a({ slug: "nyanza-cultural-heritage", name: "Nyanza Cultural Heritage", category: "Culture & History", province: "Southern", district: "Nyanza", image: culture, verified: false,
    short: "The heart of Rwanda's royal history.", description: "Heritage sites around Nyanza celebrating the monarchy, art and ceremonies.", coords: [-2.35, 29.75], activities: ["Heritage walk"], bestTime: "Year-round", duration: "Half day" }),
  a({ slug: "inyambo-cattle", name: "Inyambo Cattle Experience", category: "Culture & History", province: "Southern", district: "Nyanza", image: culture, verified: false,
    short: "Meet the royal long-horned cattle and their poets.", description: "See the majestic Inyambo cattle and hear traditional praise poetry.", coords: [-2.35, 29.74], activities: ["Cultural show"], bestTime: "Year-round", duration: "1 hour" }),
  a({ slug: "ibyiwacu-cultural-village", name: "Iby'iwacu Cultural Village", category: "Culture & History", province: "Northern", district: "Musanze", image: culture, verified: false,
    short: "Community-run village experience near the volcanoes.", description: "Dance, drum, cook and learn traditional healing with the community near Volcanoes National Park.", coords: [-1.45, 29.57], activities: ["Intore dance", "Traditional cooking", "Banana beer making"], bestTime: "Year-round", duration: "Half day" }),
  a({ slug: "kigali-convention-centre", name: "Kigali Convention Centre", category: "Kigali", province: "Kigali", district: "Gasabo", image: kigali, verified: false,
    short: "The iconic illuminated dome of modern Kigali.", description: "A landmark venue whose dome is inspired by the traditional King's Palace.", coords: [-1.9536, 30.0928], activities: ["Architecture", "Dining"], bestTime: "Year-round", duration: "1 hour" }),
  a({ slug: "kigali-city-tower", name: "Kigali City Tower", category: "Kigali", province: "Kigali", district: "Nyarugenge", image: kigali, verified: false,
    short: "Downtown shopping and city views.", description: "Rwanda's tallest building with shops, cinema and dining.", coords: [-1.9441, 30.0605], activities: ["Shopping", "Cinema"], bestTime: "Year-round", duration: "2 hours" }),
  a({ slug: "kigali-car-free-zone", name: "Kigali Car Free Zone", category: "Kigali", province: "Kigali", district: "Nyarugenge", image: kigali, verified: false,
    short: "Pedestrian heart of the city with cafés and Wi‑Fi.", description: "A walkable boulevard of cafés, art and gardens in the CBD.", coords: [-1.946, 30.06], activities: ["Cafés", "Street life"], bestTime: "Year-round", duration: "1 – 2 hours" }),
  a({ slug: "kimironko-market", name: "Kimironko Market", category: "Kigali", province: "Kigali", district: "Gasabo", image: culture, verified: false,
    short: "Kigali's buzzing market of fabrics, produce and crafts.", description: "Shop for kitenge fabric, baskets and fresh fruit at the city's busiest market.", coords: [-1.9355, 30.1255], activities: ["Shopping", "Tailoring"], bestTime: "Year-round", duration: "2 hours" }),
  a({ slug: "nyandungu-eco-park", name: "Nyandungu Eco-Park", category: "Kigali", province: "Kigali", district: "Gasabo", image: hills, verified: false,
    short: "Restored urban wetland with walking and cycling trails.", description: "A rehabilitated wetland with gardens, ponds and trails on the edge of Kigali.", coords: [-1.95, 30.15], activities: ["Walking", "Cycling", "Birding"], bestTime: "Year-round", duration: "2 hours" }),
  a({ slug: "mount-kigali", name: "Mount Kigali", category: "Kigali", province: "Kigali", district: "Nyarugenge", image: hills, verified: false,
    short: "Panoramic hikes and horseback rides above the city.", description: "The highest point in the capital, with trails, horse riding and sweeping views.", coords: [-1.98, 30.02], activities: ["Hiking", "Horse riding"], bestTime: "Year-round", duration: "Half day" }),
  a({ slug: "fazenda-sengha", name: "Fazenda Sengha", category: "Kigali", province: "Kigali", district: "Nyarugenge", image: hills, verified: false,
    short: "Adventure park with zipline and quad biking on Mount Kigali.", description: "Outdoor activities including ziplining, archery and horse riding.", coords: [-1.98, 30.03], activities: ["Zipline", "Quad biking", "Archery"], bestTime: "Year-round", duration: "Half day" }),
];

export const categories: Category[] = ["National Park", "Lake & Nature", "Culture & History", "Kigali"];
export const getAttraction = (slug: string) => attractions.find((x) => x.slug === slug);
export { hills, gorilla, akagera, nyungwe, kivu, kigali, culture, bisoke };
