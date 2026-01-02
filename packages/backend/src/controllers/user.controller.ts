import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { IUserListFilters, IUserUpdateInput } from '@sexshop/shared';

const userService = new UserService();

export class UserController {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: IUserListFilters = {
        search: req.query.search as string,
        isAdmin: req.query.isAdmin === 'true' ? true : req.query.isAdmin === 'false' ? false : undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await userService.getAllUsers(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await userService.getUserOrders(req.params.id, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getUserStats(req.params.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.id;
      const targetUserId = req.params.id;
      const updateData: IUserUpdateInput = req.body;

      const user = await userService.updateUser(targetUserId, adminUserId, updateData);

      res.json({
        success: true,
        data: user,
        message: 'Usuario actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
