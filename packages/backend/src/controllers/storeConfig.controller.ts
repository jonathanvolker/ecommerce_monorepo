import { Request, Response, NextFunction } from 'express';
import { StoreConfigService } from '../services/storeConfig.service';

const storeConfigService = new StoreConfigService();

export class StoreConfigController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await storeConfigService.get();

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await storeConfigService.update(req.body);

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }
}
