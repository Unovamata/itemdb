export type ItemData = {
  internal_id: number;
  item_id: number | null;
  name: string;
  description: string;
  image: string;
  image_id: string;
  category: string | null;
  rarity: number | null;
  weight: number | null;
  type: 'np' | 'nc' | 'pb';
  isNC: boolean;
  isWearable: boolean;
  isNeohome: boolean;
  estVal: number | null;
  specialType: string | null;
  status: 'active' | 'no trade' | null;
  color: ItemColorData;
  findAt: ItemFindAt;
  isMissingInfo: boolean;
  price: ItemPriceData;
  owls: OwlsPriceData | null;
  slug: string | null;
  comment: string | null;
};

export type ItemFindAt = {
  shopWizard?: string | null;
  auction?: string | null;
  trading?: string | null;
  closet?: string | null;
  safetyDeposit?: string | null;
  restockShop?: string | null;
  dti?: string | null;
  neosearch?: string | null;
};

export type ColorData = {
  internal_id: number;
  image: string;
  image_id: string;
  lab: [number, number, number] | number[];
  rgb: [number, number, number] | number[];
  hsv: [number, number, number] | number[];
  hex: string;
  population: number;
  type: ColorType;
};

export type ItemColorData = {
  lab: [number, number, number] | number[];
  rgb: [number, number, number] | number[];
  hsv: [number, number, number] | number[];
  hex: string;
  type: 'vibrant';
  population: number;
};

export type ItemPriceData = {
  addedAt: string | null;
  value: number | null;
  inflated: boolean;
};

export type OwlsPriceData = {
  pricedAt: string;
  valueMin: number;
  value: string;
  buyable: boolean;
};

export type ColorType =
  | 'vibrant'
  | 'darkvibrant'
  | 'lightvibrant'
  | 'muted'
  | 'darkmuted'
  | 'lightmuted';

export type FullItemColors = Record<ColorType, ColorData>;

export type PriceData = {
  value: number;
  addedAt: string;
  inflated: boolean;
};

export type ItemLastSeen = {
  sw: string | null;
  tp: string | null;
  auction: string | null;
  restock: string | null;
};

export type ItemRestockData = {
  internal_id: number;
  item: ItemData;
  stock: number;
  price: number;
  addedAt: string;
};

export type TradeData = {
  trade_id: number;
  owner: string;
  wishlist: string;
  addedAt: string;
  processed: boolean;
  priced: boolean;
  hash: string | null;
  items: {
    internal_id: number;
    trade_id: number;
    name: string;
    image: string;
    image_id: string;
    order: number;
    addedAt: string;
    price: number | null;
  }[];
};

export type ItemAuctionData = {
  internal_id: number;
  auction_id: number | null;
  item: ItemData;
  price: number;
  addedAt: string;
  owner: string;
  isNF: boolean;
  hasBuyer: boolean;
  timeLeft: string | null;
};

export type SearchResults = {
  content: ItemData[];
  page: number;
  totalResults: number;
  resultsPerPage: number;
};

export type SearchStats = {
  total: number;
  category: Record<string, number>;
  type: Record<string, number>;
  isWearable: Record<string, number>;
  isNeohome: Record<string, number>;
  status: Record<string, number>;
};

export type SearchFilters = {
  category: string[];
  type: string[];
  status: string[];
  color: string;
  price: string[]; // [min, max]
  rarity: string[]; // [min, max]
  weight: string[]; // [min, max]
  estVal: string[]; // [min, max]
  owlsValue: string[]; // [min, max]
  restockProfit: string; // min profit %
  sortBy: string;
  sortDir: string;
  mode: 'name' | 'description' | 'all';
  limit: number;
  page: number;
};

export type ExtendedSearchQuery = SearchFilters & {
  s: string;
};

export type ItemTag = {
  tag_id: number;
  name: string;
  description: string | null;
  type: 'tag';
};

export type User = {
  id: string;
  username: string | null;
  neopetsUser: string | null;
  email: string;
  role: UserRoles;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
  profileColor: string | null;
  profileImage: string | null;
  description: string | null;

  xp: number;
};

export type UserRoles = 'USER' | 'ADMIN' | 'SYSTEM';

export type UserList = {
  internal_id: number;
  name: string;
  description: string | null;

  /** @deprecated use owner field instead */
  user_id: string;
  /** @deprecated use owner field instead */
  user_username: string;
  /** @deprecated use owner field instead */
  user_neouser: string;

  owner: {
    id: string;
    username: string | null;
    neopetsUser: string | null;
    lastSeen: string;
  };

  coverURL: string | null;
  official: boolean;

  purpose: 'none' | 'seeking' | 'trading';
  visibility: 'public' | 'private' | 'unlisted';

  colorHex: string | null;

  sortBy: string;
  sortDir: string;
  order: number | null;

  createdAt: string;
  updatedAt: string;

  itemInfo: ListItemInfo[];
  itemCount: number;

  dynamicType: 'addOnly' | 'removeOnly' | 'fullSync' | null;
  lastSync: string | null;
  linkedListId: number | null;
};

export type ListItemInfo = {
  internal_id: number;
  list_id: number;
  item_iid: number;
  addedAt: string;
  updatedAt: string;
  amount: number;
  capValue: number | null;
  imported: boolean;
  order: number | null;
  isHighlight: boolean;
  isHidden: boolean;
};

export type Pallete = {
  lab: number[];
  hsv: number[];
  rgb: number[];
  hex: string;
  type: string;
  population: number;
};

export type WP_Article = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  thumbnail: string | null;
  palette: Record<ColorType, Pallete> | null;
};

export type ItemOpenable = {
  openings: number;
  pools: { [name: string]: PrizePoolData };
  notes: string | null;
  drops: { [id: number]: ItemDrop };
  hasLE: boolean;
  isGBC: boolean;
  isChoice: boolean;
  maxDrop: number;
  minDrop: number;
};

export type PrizePoolData = {
  name: string;
  items: number[];
  openings: number;
  maxDrop: number;
  minDrop: number;
  totalDrops: number;
};

export type ItemDrop = {
  item_iid: number;
  dropRate: number;
  notes: string | null;
  isLE: boolean;
  pool: string | null;
};

export type UserAchievement = {
  name: string;
  image: string;
};

// ------- FEEDBACKS JSON -------- //
export type Feedback = {
  feedback_id: number;
  addedAt: string;
  email: string | null;
  json: string;
  type: FeedbackType;
  parsed?: FeedbackParsed | null;
  processed: boolean;
  subject_id: number | null;
  user_id: string | null;
  votes: number;
};

export type FeedbackType = 'tradePrice' | 'itemChange';

export type EditItemFeedbackJSON = {
  itemTags: string[];
  itemNotes?: string;
};

export type FeedbackParsed = {
  ip: string;
  pageRef: string;
  content: any;
};

export type OwlsTrade = {
  ds: string;
  traded: string;
  traded_for: string;
  notes: string;
};

// ------- DTI -------- //

export type DTISpecies = {
  id: string;
  name: string;
};

export type DTIColor = {
  name: string;
  id: string;
  isStandard: boolean;
  appliedToAllCompatibleSpecies: {
    species: DTISpecies;
  }[];
};

export type DTIZoneQuery = {
  id: string;
  isCommonlyUsedByItems: boolean;
  label: string;
};

export type DTILayer = {
  id: string;
  imageUrlV2: string;
  knowGlitches: string[];
  remoteId: string;
  zone: {
    id: string;
    depth: number;
    label: string;
  };
};

export type DTIItemPreview = {
  id: string;
  name: string;
  canonicalAppearance: DTICanonicalAppearance;
};

export type DTICanonicalAppearance = {
  id: string;
  restrictedZones: {
    id: string;
    depth: number;
    label: string;
  }[];
  layers: DTILayer[];
  body: {
    canonicalAppearance: DTIPetAppearance;
  };
};

export type DTIPetAppearance = {
  bodyId: string;
  color: {
    id: string;
    name: string;
  };
  id: string;
  isGlitched: boolean;
  layers: DTILayer[];
  pose: string[];
  restrictedZones: string[];
  species: {
    id: string;
    name: string;
  };
};
