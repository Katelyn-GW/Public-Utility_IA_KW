export interface Tattoo {
  id: string;
  imageUrl: string;
  title: string;
  style: string;
  price?: number;
  description?: string;
  savedDescription?: string;
  keywords?: string[];
  labels?: string[];
  colors?: string[];
  sizes?: string[];
}

export interface ARPhoto {
  id: string;
  imageUrl: string;
  tattooId: string;
  tattooTitle: string;
  tattooImageUrl?: string;
  title?: string;
  description?: string;
  createdAt: string;
}

export interface LibraryItem extends Tattoo {
  savedAt: string;
}