import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { httpLogger } from './middlewares/httpLogger';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import storeConfigRoutes from './routes/storeConfig.routes';
import uploadRoutes from './routes/upload.routes';

// Cargar .env (en Docker las vars vienen por env_file, en dev busca .env local)
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definido en las variables de entorno');
  process.exit(1);
}

// Trust proxy para rate limiter y IPs reales
app.set('trust proxy', 1);

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*',
  credentials: true,
}));
app.use(compression());

// Middlewares de parseo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logger
app.use(httpLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/store-config', storeConfigRoutes);
app.use('/api/upload', uploadRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Conectar a MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  });

export default app;
