import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { OrderStatus } from '@sexshop/shared';

const orderService = new OrderService();

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await orderService.getByUser(req.user!.id, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Los usuarios solo pueden ver sus propias órdenes, admin puede ver todas
      const userId = req.user!.isAdmin ? undefined : req.user!.id;
      const order = await orderService.getById(req.params.id, userId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus | undefined;

      const result = await orderService.getAll(page, limit, status);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, adminNotes, shippingCost } = req.body;
      
      const order = await orderService.updateStatus(
        req.params.id,
        status,
        adminNotes,
        shippingCost
      );

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadPaymentProof(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { proofUrl } = req.body;
      
      const order = await orderService.uploadPaymentProof(
        req.params.id,
        req.user!.id,
        proofUrl
      );

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
