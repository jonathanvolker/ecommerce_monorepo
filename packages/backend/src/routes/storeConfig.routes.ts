import { Router, IRouter } from 'express';
import { StoreConfigController } from '../controllers/storeConfig.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router: IRouter = Router();
const storeConfigController = new StoreConfigController();

// Public route - cualquiera puede ver la config de la tienda
router.get('/', storeConfigController.get.bind(storeConfigController));

// Admin route - solo admin puede actualizar
router.put(
  '/',
  authenticate,
  requireAdmin,
  storeConfigController.update.bind(storeConfigController)
);

export default router;
