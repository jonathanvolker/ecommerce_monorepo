import { User, Order } from '../models';
import { IUserWithStats, IUserStats, IUserUpdateInput, IUserListFilters } from '@sexshop/shared';
import { AppError } from '../middlewares/errorHandler';
import { OrderStatus } from '@sexshop/shared';
import mongoose from 'mongoose';

export class UserService {
  async getAllUsers(filters: IUserListFilters = {}) {
    const {
      search = '',
      isAdmin,
      isActive,
      page = 1,
      limit = 20,
    } = filters;

    // Construir query
    interface QueryFilter {
      $or?: Array<Record<string, unknown>>;
      isAdmin?: boolean;
      isActive?: boolean;
    }
    const query: QueryFilter = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (typeof isAdmin === 'boolean') {
      query.isAdmin = isAdmin;
    }

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    // Obtener usuarios y total
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Obtener estadísticas para cada usuario
    const usersWithStats: IUserWithStats[] = await Promise.all(
      users.map(async (user) => {
        const stats = await this.getUserStats(user._id.toString());
        return {
          ...user,
          _id: user._id.toString(),
          createdAt: user.createdAt,
          totalSpent: stats.totalSpent,
          totalOrders: stats.totalOrders,
          lastOrderDate: stats.lastOrderDate,
        };
      })
    );

    return {
      users: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const stats = await this.getUserStats(userId);

    return {
      ...user,
      _id: user._id.toString(),
      ...stats,
    };
  }

  async getUserStats(userId: string): Promise<IUserStats> {
    // Convertir userId a ObjectId para el aggregate
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Agregar estadísticas de órdenes (excluyendo canceladas)
    const stats = await Order.aggregate([
      { $match: { user: userObjectId, orderStatus: { $ne: OrderStatus.CANCELLED } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', OrderStatus.DELIVERED] }, 1, 0],
            },
          },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalSpent: 0,
        totalOrders: 0,
        completedOrders: 0,
      };
    }

    return {
      totalSpent: stats[0].totalSpent || 0,
      totalOrders: stats[0].totalOrders || 0,
      completedOrders: stats[0].completedOrders || 0,
      lastOrderDate: stats[0].lastOrderDate,
      firstOrderDate: stats[0].firstOrderDate,
    };
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(userId: string, adminUserId: string, data: IUserUpdateInput) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Validar que el admin no se desactive a sí mismo
    if (userId === adminUserId && data.isActive === false) {
      throw new AppError('No puedes desactivar tu propia cuenta', 400);
    }

    // Validar que el admin no se quite permisos a sí mismo
    if (userId === adminUserId && data.isAdmin === false) {
      throw new AppError('No puedes quitarte permisos de administrador', 400);
    }

    // Actualizar campos permitidos
    if (typeof data.isAdmin === 'boolean') {
      user.isAdmin = data.isAdmin;
    }

    if (typeof data.isActive === 'boolean') {
      user.isActive = data.isActive;
    }

    await user.save();

    // Devolver usuario sin password
    const updatedUser = await User.findById(userId).select('-password').lean();
    return updatedUser;
  }
}
