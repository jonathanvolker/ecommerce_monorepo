import { Product, Category } from '../models';
import { ICreateProductInput, IUpdateProductInput, IProductFilters } from '@sexshop/shared';
import { AppError } from '../middlewares/errorHandler';

export class ProductService {
  async getAll(filters: IProductFilters, page = 1, limit = 12, sortBy?: string) {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      // Usar regex para búsqueda flexible (como en el admin)
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.isFeatured !== undefined) {
      query.featured = filters.isFeatured;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    const skip = (page - 1) * limit;
    
    // Determinar orden
    let sort: any = { createdAt: -1 }; // Por defecto: más recientes primero
    if (sortBy === 'price_asc') {
      sort = { price: 1 }; // Precio menor a mayor
    } else if (sortBy === 'price_desc') {
      sort = { price: -1 }; // Precio mayor a menor
    }
    
    const [products, total] = await Promise.all([
      Product.find(query)
        // NO hacer populate porque category es string en MongoDB, no ObjectId
        // .populate('category', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean(),
      Product.countDocuments(query),
    ]);

    // MAPEAR productos de MongoDB al formato esperado
    const mappedProducts = products.map((product: any) => ({
      ...product,
      // Convertir 'image' (string) a 'images' (array)
      images: product.images?.length > 0 
        ? product.images 
        : product.image 
          ? [product.image] 
          : [],
      // Asegurar specifications
      specifications: product.specifications || {},
    }));

    return {
      items: mappedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const product = await Product.findById(id).lean();
    // NO hacer populate porque category es string en MongoDB
    
    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }

    // MAPEAR igual que en getAll
    const mappedProduct: any = {
      ...product,
      images: (product as any).images?.length > 0 
        ? (product as any).images 
        : (product as any).image 
          ? [(product as any).image] 
          : [],
      featured: (product as any).isFeatured || (product as any).featured || false,
      specifications: (product as any).specifications || {},
    };

    return mappedProduct;
  }

  async create(input: ICreateProductInput) {
    // Category ahora es string, no necesita validación
    const product = await Product.create(input);
    return product;
  }

  async update(id: string, input: IUpdateProductInput) {
    // Category ahora es string, no necesita validación
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }

    return product;
  }

  async delete(id: string) {
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }

    return { message: 'Producto eliminado correctamente' };
  }

  async getFeatured(limit = 6) {
    return Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}
