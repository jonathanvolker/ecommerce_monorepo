import { Category } from '../models';
import { Product } from '../models';
import { AppError } from '../middlewares/errorHandler';

export class CategoryService {
  async syncFromProducts() {
    // eslint-disable-next-line no-useless-catch
    try {
      // Obtener categorías únicas de productos
      const productCategories = await Product.distinct('category');
      
      // Para cada categoría, crearla si no existe
      for (const categoryName of productCategories) {
        if (!categoryName) continue;
        
        const exists = await Category.findOne({ name: categoryName });
        if (!exists) {
          // Generar slug manualmente
          const slug = categoryName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          
          await Category.create({
            name: categoryName,
            slug: slug,
            description: `Categoría ${categoryName}`,
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async getAll(includeInactive = false) {
    // Sincronizar categorías de productos primero
    await this.syncFromProducts();
    
    const query = includeInactive ? {} : { isActive: true };
    return Category.find(query).sort({ name: 1 });
  }

  async getList() {
    // Lightweight endpoint for category list (no sync, minimal data)
    return Category.find({ isActive: true })
      .select('name slug')
      .sort({ name: 1 })
      .lean();
  }

  async getById(id: string) {
    const category = await Category.findById(id);
    
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return category;
  }

  async getBySlug(slug: string) {
    const category = await Category.findOne({ slug });
    
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return category;
  }

  async create(name: string, description?: string) {
    // Generar slug manualmente
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    const category = await Category.create({ name, slug, description });
    return category;
  }

  async update(id: string, name?: string, description?: string, isActive?: boolean) {
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      // Regenerar slug si cambia el nombre
      updateData.slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return category;
  }

  async delete(id: string) {
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return { message: 'Categoría eliminada correctamente' };
  }
}
