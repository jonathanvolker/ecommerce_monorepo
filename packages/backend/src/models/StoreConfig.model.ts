import mongoose, { Schema, Document } from 'mongoose';
import { IStoreConfig } from '@sexshop/shared';

export interface IStoreConfigDocument extends Omit<IStoreConfig, '_id'>, Document {}

const bankDetailsSchema = new Schema({
  cbu: {
    type: String,
    required: true,
    trim: true,
  },
  alias: {
    type: String,
    required: true,
    trim: true,
  },
  accountHolder: {
    type: String,
    required: true,
    trim: true,
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
  },
});

const storeConfigSchema = new Schema<IStoreConfigDocument>(
  {
    bankDetails: {
      type: bankDetailsSchema,
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    instagramUrl: {
      type: String,
      trim: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      default: 'SexySecret',
    },
    storeAddress: {
      type: String,
      trim: true,
    },
    pickupInstructions: {
      type: String,
      trim: true,
      default: 'Coordinar retiro por local de lunes a viernes de 10 a 18hs.',
    },
    shippingInstructions: {
      type: String,
      trim: true,
      default: 'El costo de envío se coordina según la distancia. Envíos por Vía Cargo o Correo Argentino.',
    },
    homeMainText: {
      type: String,
      trim: true,
      default: 'Cargar texto principal desde panel admin',
    },
    homeSecondaryText: {
      type: String,
      trim: true,
      default: 'Cargar texto secundario desde panel admin',
    },
    privacyPolicy: {
      type: String,
      trim: true,
      default: 'Cargar política de privacidad desde panel admin',
    },
    termsOfService: {
      type: String,
      trim: true,
      default: 'Cargar términos y condiciones desde panel admin',
    },
    footerBrandName: {
      type: String,
      trim: true,
      default: 'SexySecret',
    },
    footerTagline: {
      type: String,
      trim: true,
      default: 'La privacidad es lo que nos diferencia.',
    },
    copyrightText: {
      type: String,
      trim: true,
      default: '© 2025 SexySecret. Todos los derechos reservados. +18',
    },
    shippingCosts: {
      VIA_CARGO: {
        type: Number,
        default: 0,
      },
      CORREO_ARGENTINO: {
        type: Number,
        default: 0,
      },
    },
  } as any,
  {
    timestamps: true,
  }
);

export const StoreConfig = mongoose.model<IStoreConfigDocument>(
  'StoreConfig',
  storeConfigSchema
);
