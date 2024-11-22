// Represents an individual attribute of a category
export interface CategoryAttribute {
  id: string;
  name: string;
  handle: string;
  description: string;
  extended: boolean;
}

// Represents a basic category reference (used in children and ancestors)
export interface CategoryReference {
  id: string;
  name: string;
}

// Represents a full category with its details, children, attributes, and ancestors
export interface Category {
  id: string;
  level: number;
  name: string;
  full_name: string;
  parent_id: string | null;
  attributes: CategoryAttribute[];
  children: CategoryReference[];
  ancestors: CategoryReference[];
}

// Represents a vertical containing multiple categories
export interface Vertical {
  name: string;
  prefix: string;
  categories: Category[];
}
