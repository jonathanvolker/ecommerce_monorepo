import { Router, type Router as ExpressRouter } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router: ExpressRouter = Router();
const userController = new UserController();

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticate, requireAdmin);

// GET /api/users - Listar todos los usuarios
router.get('/', userController.getAllUsers.bind(userController));

// GET /api/users/:id - Obtener detalles de un usuario
router.get('/:id', userController.getUserById.bind(userController));

// GET /api/users/:id/orders - Obtener pedidos de un usuario
router.get('/:id/orders', userController.getUserOrders.bind(userController));

// GET /api/users/:id/stats - Obtener estadísticas de un usuario
router.get('/:id/stats', userController.getUserStats.bind(userController));

// PATCH /api/users/:id - Actualizar usuario (rol, estado)
router.patch('/:id', userController.updateUser.bind(userController));

export default router;
