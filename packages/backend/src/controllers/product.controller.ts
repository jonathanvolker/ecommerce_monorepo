import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { IProductFilters } from '@sexshop/shared';

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const sortBy = req.query.sortBy as string;
      
      const filters: IProductFilters = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        search: req.query.search as string,
        isFeatured: req.query.isFeatured === 'true' ? true : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        isOnSale: req.query.isOnSale === 'true' ? true : undefined,
      };

      const result = await productService.getAll(filters, page, limit, sortBy);
    
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ [PRODUCTS] Error en getAll:', error);
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const products = await productService.getFeatured(limit);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.delete(req.params.id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
