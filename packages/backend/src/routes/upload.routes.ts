import { Router, Request, Response } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();
const uploadController = new UploadController();

// Configurar multer para memoria (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

// POST /api/upload - Subir imagen (requiere autenticación)
router.post(
  '/',
  authenticate,
  upload.single('image'),
  uploadController.uploadImage.bind(uploadController)
);

export default router;
