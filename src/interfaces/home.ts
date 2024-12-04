export interface SEOData {
  titleHead: string; // The title of the page for SEO
  descriptionHead: string; // The meta description for the page
  og_type: string; // The Open Graph type (e.g., "website")
  og_image: string[]; // Array of image URLs for Open Graph
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface CategoriesState {
  categories: Category[];
}

export interface Countries {
  _id: string;
  name: string;
  slug: string;
}

export interface CountriesState {
  countries: Countries[];
}

