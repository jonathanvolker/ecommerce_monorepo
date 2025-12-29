import { Router, IRouter } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router: IRouter = Router();
const orderController = new OrderController();

// Protected routes (requieren autenticación)
router.get('/my-orders', authenticate, orderController.getMyOrders.bind(orderController));
router.post('/', authenticate, orderController.create.bind(orderController));
router.get('/:id', authenticate, orderController.getById.bind(orderController));
router.post(
  '/:id/payment-proof',
  authenticate,
  orderController.uploadPaymentProof.bind(orderController)
);

// Admin routes
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  orderController.getAll.bind(orderController)
);
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  orderController.updateStatus.bind(orderController)
);

export default router;
