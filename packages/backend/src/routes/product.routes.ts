import { Router, IRouter } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router: IRouter = Router();
const productController = new ProductController();

// Public routes
router.get('/', productController.getAll.bind(productController));
router.get('/featured', productController.getFeatured.bind(productController));
router.get('/:id', productController.getById.bind(productController));

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  productController.create.bind(productController)
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  productController.update.bind(productController)
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.delete.bind(productController)
);

export default router;
