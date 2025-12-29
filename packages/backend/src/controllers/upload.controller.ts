import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middlewares/errorHandler';

// Configurar Cloudinary con URL string o variables individuales
if (process.env.CLOUDINARY_URL) {
  // Si existe CLOUDINARY_URL, cloudinary se configura automáticamente
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  // Fallback a variables individuales
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('📤 [UPLOAD] Iniciando subida de imagen');
      console.log('📤 [UPLOAD] Archivo recibido:', req.file ? 'SÍ' : 'NO');
      console.log('📤 [UPLOAD] CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
      console.log('📤 [UPLOAD] CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Configurada' : 'NO configurada');
      console.log('📤 [UPLOAD] CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'Configurada' : 'NO configurada');
      
      if (!req.file) {
        throw new AppError('No se proporcionó ninguna imagen', 400);
      }

      // Verificar que Cloudinary esté configurado
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        console.error('❌ [UPLOAD] Cloudinary NO configurado, devolviendo placeholder');
        // Si no está configurado, devolver una URL de placeholder
        const placeholderUrl = 'https://via.placeholder.com/400x400?text=Imagen+No+Disponible';
        return res.json({
          success: true,
          url: placeholderUrl,
          message: 'Cloudinary no configurado, usando placeholder',
        });
      }
      
      console.log('✅ [UPLOAD] Cloudinary configurado, procediendo a subir...');

      // Subir a Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'sexshop-products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file!.buffer);
      });

      console.log('✅ [UPLOAD] Imagen subida exitosamente:', (result as any).secure_url);

      res.json({
        success: true,
        url: (result as any).secure_url,
      });
    } catch (error) {
      console.error('❌ [UPLOAD] Error al subir imagen:', error);
      next(error);
    }
  }
}
