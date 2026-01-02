export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface IRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
}

// Mantener para retrocompatibilidad
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// User management types
export interface IUserWithStats extends IUserResponse {
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: Date;
}

export interface IUserUpdateInput {
  isAdmin?: boolean;
  isActive?: boolean;
}

export interface IUserListFilters {
  search?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface IUserStats {
  totalSpent: number;
  totalOrders: number;
  completedOrders: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;
}
