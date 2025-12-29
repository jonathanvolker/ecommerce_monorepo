export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // Esperando transferencia
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED', // Pago confirmado por admin
  PREPARING = 'PREPARING', // Preparando el pedido
  READY_FOR_PICKUP = 'READY_FOR_PICKUP', // Listo para retiro
  SHIPPED = 'SHIPPED', // Enviado
  DELIVERED = 'DELIVERED', // Entregado
  CANCELLED = 'CANCELLED', // Cancelado
}

export enum ShippingMethod {
  PICKUP = 'PICKUP', // Retiro por local ($0)
  VIA_CARGO = 'VIA_CARGO', // Vía Cargo (a coordinar)
  CORREO_ARGENTINO = 'CORREO_ARGENTINO', // Correo Argentino (a coordinar)
}

export interface IOrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICreateOrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  notes?: string;
}

export interface IOrder {
  _id: string;
  user: { _id: string; email: string; firstName: string; lastName: string } | string;
  items: IOrderItem[];
  shippingMethod: ShippingMethod;
  shippingAddress?: IShippingAddress;
  totalAmount: number;
  shippingCost?: number;
  orderStatus: OrderStatus;
  paymentProof?: string;
  adminNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateOrderInput {
  items: ICreateOrderItemInput[];
  shippingMethod: ShippingMethod;
  shippingAddress?: IShippingAddress; // Solo requerido si no es PICKUP
  shippingCost?: number;
}
