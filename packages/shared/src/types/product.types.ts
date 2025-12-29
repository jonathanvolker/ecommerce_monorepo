export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ICategory | string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  isOnSale: boolean;
  specifications: Record<string, string>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ICreateProductInput {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isActive?: boolean;
  featured?: boolean;
  isOnSale?: boolean;
  specifications?: Record<string, string>;
}

export interface IUpdateProductInput extends Partial<ICreateProductInput> {
  _id: string;
}

export interface IProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}
