export interface Recipe {
  channel: string;
  channel_path: string;
  custom: boolean;
  gluten_free: boolean;
  image: string;
  link: string;
  private: boolean;
  published: boolean;
  servings: number;
  source: string;
  time: number;
  title: string;
  id: string;
  micronutrient_score: number;
  plannerData: any;
  servingsAdjusted?: number;
  search_terms: string[];
  ingredients: IngredientFormatted[];
  ingredients_formatted: IngredientFormatted[];
  ingredientGroups: RecipeGroup[];
  method: MethodItem[];
  description?: string;
  hours?: number;
  minutes?: number;
  iframe?: string;
  websiteSource?: string;
  entity: {
    id: string;
    type: string;
  };
  creator?: {
    id: string;
    image: string;
    name: string;
  };
  categories?: Object;
  sourceType?: 'My own creation' | 'From a cookbook' | 'From a website';
  nutrients: Object;
}

export interface Ingredient {
  also_called?: string[];
  alternatives?: string[];
  checked?: boolean;
  example_servings?: {
    frequency: number;
    quantity: string;
    unit: string;
  }[];
  ingredient?: string;
  ingredient_map?: Object;
  order_by?: Object;
  shopping_list_category?: string;
  supermarket_product?: boolean;
  usda_data?: USDAData;
  exampleServings?: any[];
}

export interface USDAData {
  data_type: string;
  default_serving?: any;
  fdc_id?: number;
  grams_per_cup?: number;
  portion_conversion?: {
    quantity_conversion: {
      gram_weight?: string;
      portion_quantity?: string;
      usda_portion_id?: string;
    }[];
  };
  reference_unit: string;
  source_name: string;
  usda_category: string;
  usda_name: string;
  usda_nutrition: any[];
}

export interface IngredientFormatted {
  ingredient: string;
  mappedIngredient: boolean;
  quantity: number;
  unit: string;
  data?: any; // TODO
  group?: string;
  recipe?: Recipe;
}

export interface IngredientGroup {
  name: string;
  id: string;
}

export interface MethodItem {
  instruction: string;
  image?: string;
  video?: string;
  timer?: number;
}

export interface Review {
  review: string;
  rating: number;
  approved: boolean;
  createdAt: any;
  difficulty: number;
  feel: number;
  taste: number;
  userData: any;
  id: string;
  image: string;
  recipeSearchTerms: {};
  recipeId: string;
  recipeTitle: string;
}

export interface Collection {
  title: string;
  count: number;
  createdAt: Date;
  id: string;
  userId: string;
  image?: string;
}

export interface Snapshot {
  exists: boolean;
}

export interface Results {
  results: Recipe[];
  lastVisible: any;
}

export interface Profile {
  firstName: string;
  lastName: string;
  image: string;
  id: string;
  links: string[];
  count: number;
  allowFollowersToComment?: boolean;
}

export interface ModalData {
  type: string;
  // dataObject?: {
  //   data: {
  //     id?: string;
  //     collection?: string;
  //     recipes?: Recipe[];
  //   };
  //   type?: string;
  // };
  data: any;
  show: boolean;
  showModal: Function;
  hideModal: Function;
  onComplete: Function;
  refresh: number;
}

export interface Notification {
  accepted?: boolean;
  actionId: string;
  createdAt: any;
  seen: boolean;
  type: string;
  id?: string;
  toEntityType?: 'user' | 'page' | 'venue';
  fromEntityType?: 'user' | 'page' | 'venue';
  toEntityId: string;
  fromEntityId: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  image: string;
  id: string;
}

export interface Entity {
  name: string;
  image: string;
  href: string;
  id: string;
  type: 'user' | 'page' | 'venue';
}

export interface Post {
  allowComments: boolean;
  createdAt: any;
  entityData?: Entity;
  id: string;
  pageSource?: string;
  venueSource?: string;
  recipeId?: string;
  collectionCount?: number;
  collectionId?: string;
  type?: 'created' | 'reviewed' | 'cooked' | 'saved' | 'post' | 'collection_count';
  sourceType: 'user' | 'page' | 'venue';
  sourceId: 'string';
  post?: {
    address: string;
    addressPlaceId: string;
    image: string;
    link: string;
    rating: string;
    text: string;
    title: string;
    type: {
      allowedMedia: string[];
      type: string;
    };
  };
}

export interface Comment {
  comment: string;
  createdAt: Date;
  notificationId: string;
  repliedToComment: boolean;
  userId?: string;
  id?: string;
  sourceType?: string;
  sourceId?: string;
  pageId?: string;
  venueId?: string;
  entityId?: string;
  entityType?: string;
}

export interface Page {
  count?: number;
  coverPhoto?: string;
  description?: string;
  email?: string;
  facebook?: string;
  id?: string;
  instagram?: string;
  name?: string;
  page?: boolean;
  profilePhoto?: string;
  website?: string;
  links?: SocialLink[];
}

export interface SocialLink {
  name: string;
  href: string;
}

export interface RecipeGroup {
  group: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  ingredient: string;
  quantity: number;
  unit: string;
  id: number;
  note: string;
}

export interface Instruction {
  name: string;
  id: string;
  video: string;
  image: string;
  timer?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export interface Timer {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ListIngredient {
  checked?: boolean;
  id: string;
  combinedAmounts?: CombinedAmount[];
  combinedAmount: CombinedAmount[];
  dataFetched?: IngredientFormatted & { shopping_list_category?: string };
  ingredient: string;
  hasCategory?: boolean;
  unit?: string;
  quantity?: number;
  data?: any;
  recipe?: Recipe;
}

export interface AddToListIngredient {
  ingredient: string;
  example_servings: string[];
}

export interface ListCategory {
  dbName?: string;
  name: string;
  combinedIngredients?: ListIngredient[];
  ingredients?: ListIngredient[];
  title?: string;
}

export interface CombinedAmount {
  ids?: string[];
  checked?: boolean;
  unit?: string;
  quantity?: number;
  amount?: number;
}

export interface IngredientOccurance {
  recipeTitle: string;
  recipeId: string;
  unit: string;
  quantity: number;
}

export interface AmazonCartLink {
  ingredients: {
    name: string;
    componentIndex: number;
    quantityList: any[];
  }[];
  saved: boolean;
  recipeComposition: {
    saved: boolean;
  };
  tag: string;
}

export interface CartLink {
  index: number;
  link: string;
}

export interface RecipeStatus {
  saved: boolean;
  cooked: boolean;
  occurances: {
    date: Date;
    plannerId: string;
    sharedPlanned: boolean;
  };
}
