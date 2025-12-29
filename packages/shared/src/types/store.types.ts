export interface IBankDetails {
  cbu: string;
  alias: string;
  accountHolder: string;
  bankName: string;
}

export interface IStoreConfig {
  _id: string;
  bankDetails: IBankDetails;
  whatsappNumber: string; // Formato: 5491123456789
  instagramUrl?: string; // URL del perfil de Instagram
  storeName: string;
  storeAddress?: string;
  pickupInstructions?: string; // Instrucciones para retiro en local
  shippingInstructions?: string; // Instrucciones para envíos
  homeMainText?: string; // Texto principal de la home
  homeSecondaryText?: string; // Texto secundario del footer
  privacyPolicy?: string; // Política de privacidad
  termsOfService?: string; // Términos y condiciones
  footerBrandName?: string; // Nombre de marca en footer
  footerTagline?: string; // Eslogan del footer
  copyrightText?: string; // Texto de copyright
  shippingCosts?: {
    VIA_CARGO: number;
    CORREO_ARGENTINO: number;
  }; // Costos de envío, default 0
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateStoreConfigInput {
  bankDetails?: IBankDetails;
  whatsappNumber?: string;
  instagramUrl?: string;
  storeName?: string;
  storeAddress?: string;
  pickupInstructions?: string;
  shippingInstructions?: string;
  homeMainText?: string;
  homeSecondaryText?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  footerBrandName?: string;
  footerTagline?: string;
  copyrightText?: string;
  shippingCosts?: {
    VIA_CARGO: number;
    CORREO_ARGENTINO: number;
  };
}
