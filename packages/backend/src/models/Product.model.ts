import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '@sexshop/shared';

export interface IProductDocument extends Omit<IProduct, '_id' | 'category'>, Document {
  category: string; // En MongoDB está guardado como string, no ObjectId
}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [200, 'El nombre no puede exceder 200 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    images: {
      type: [String],
      required: [true, 'Al menos una imagen es requerida'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Debe haber al menos una imagen',
      },
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'El stock es requerido'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
  } as any,
  {
    timestamps: true,
  }
);

// Índices para búsqueda
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, isActive: 1 });

export const Product = mongoose.model<IProductDocument>('Product', productSchema);
