import { Order, Product, User } from '../models';
import { ICreateOrderInput, OrderStatus } from '@sexshop/shared';
import { AppError } from '../middlewares/errorHandler';
import { buildOrderAdminEmail, buildOrderConfirmationEmail, sendMail } from './email.service';
import { Types } from 'mongoose';

export class OrderService {
  async create(userId: string, input: ICreateOrderInput) {
    // Construir items completos con información del producto
    const orderItems = [];
    
    // Validar que todos los productos existen y hay stock
    for (const item of input.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new AppError(`Producto ${item.productId} no encontrado`, 404);
      }

      if (!product.isActive) {
        throw new AppError(`El producto ${product.name} no está disponible`, 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          400
        );
      }

      // Construir item completo para la orden
      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      });
    }

    // Calcular total
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = input.shippingCost || 0;
    const totalAmount = subtotal + shippingCost;

    // Crear orden
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingMethod: input.shippingMethod,
      shippingAddress: input.shippingAddress,
      totalAmount,
      shippingCost,
      orderStatus: OrderStatus.PENDING_PAYMENT,
    });

    // Descontar stock en bulk (1 query vs N queries)
    const bulkOps = input.items.map(item => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.productId) },
        update: { $inc: { stock: -item.quantity } }
      }
    }));
    
    await Product.bulkWrite(bulkOps);

    await order.populate('user', 'firstName lastName email');
    
      // Notificar por correo (no bloquear el flujo si falla)
      try {
        const userMail = buildOrderConfirmationEmail(order);
        await sendMail({
          to: (order.user as any).email,
          subject: userMail.subject,
          html: userMail.html,
          text: userMail.text,
        });

        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);

        if (adminEmails.length > 0) {
          const adminMail = buildOrderAdminEmail(order);
          await sendMail({
            to: adminEmails,
            subject: adminMail.subject,
            html: adminMail.html,
            text: adminMail.text,
          });
        }
      } catch (err) {
        console.error('❌ Error enviando mails de orden:', err);
      }

    return order;
  }

  async getByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      items: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(orderId: string, userId?: string) {
    const order = await Order.findById(orderId).populate('user', 'firstName lastName email');

    if (!order) {
      throw new AppError('Orden no encontrada', 404);
    }

    // Si no es admin, verificar que la orden pertenece al usuario
    if (userId && order.user._id.toString() !== userId) {
      throw new AppError('No tienes acceso a esta orden', 403);
    }

    return order;
  }

  async getAll(page = 1, limit = 20, status?: OrderStatus) {
    const query: any = {};
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      items: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    adminNotes?: string,
    shippingCost?: number
  ) {
    const updateData: any = { orderStatus: status };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (shippingCost !== undefined) {
      updateData.shippingCost = shippingCost;
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'firstName lastName email');

    if (!order) {
      throw new AppError('Orden no encontrada', 404);
    }

    // Recalcular totalAmount si se cambió shippingCost
    if (shippingCost !== undefined) {
      const subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      order.totalAmount = subtotal + shippingCost;
      await order.save();
    }

    return order;
  }

  async uploadPaymentProof(orderId: string, userId: string, proofUrl: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Orden no encontrada', 404);
    }

    if (order.user.toString() !== userId) {
      throw new AppError('No tienes acceso a esta orden', 403);
    }

    order.paymentProof = proofUrl;
    await order.save();

    return order;
  }
}
