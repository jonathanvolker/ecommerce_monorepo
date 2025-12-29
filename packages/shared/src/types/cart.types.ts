export interface ICartItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddToCartInput {
  productId: string;
  quantity: number;
}

export interface IUpdateCartItemInput {
  productId: string;
  quantity: number;
}
