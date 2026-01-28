import { Router, IRouter } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router: IRouter = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getAll.bind(categoryController));
router.get('/list', categoryController.getList.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));
router.get('/slug/:slug', categoryController.getBySlug.bind(categoryController));

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  categoryController.create.bind(categoryController)
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.update.bind(categoryController)
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.delete.bind(categoryController)
);

export default router;
