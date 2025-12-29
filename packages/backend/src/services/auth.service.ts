import jwt from 'jsonwebtoken';
import { User } from '../models';
import { IRegisterInput, ILoginInput, IAuthResponse } from '@sexshop/shared';
import { AppError } from '../middlewares/errorHandler';

interface TokenPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export class AuthService {
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    } as any);
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    } as any);
  }

  async register(input: IRegisterInput): Promise<IAuthResponse> {
    console.log('📝 [REGISTER] Intento de registro:', { email: input.email, firstName: input.firstName });
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      console.log('❌ [REGISTER] Email ya existe:', input.email);
      throw new AppError('El email ya está registrado', 409);
    }

    // Crear usuario
    console.log('➕ [REGISTER] Creando usuario en BD...');
    const user = await User.create({
      ...input,
      isAdmin: false,
      isActive: true,
    });
    console.log('✅ [REGISTER] Usuario creado:', user._id);

    // Generar tokens
    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: ILoginInput): Promise<IAuthResponse> {
    console.log('🔐 [LOGIN] Intento de login:', input.email);
    // Buscar usuario con password
    const user = await User.findOne({ email: input.email }).select('+password');
    
    if (!user) {
      console.log('❌ [LOGIN] Usuario no encontrado:', input.email);
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new AppError('Usuario inactivo', 403);
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(input.password);
    console.log('🔑 [LOGIN] Password válido:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Password incorrecto para:', input.email);
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;

      // Verificar que el usuario aún existe y está activo
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError('Usuario no encontrado o inactivo', 401);
      }

      // Generar nuevo access token
      const payload: TokenPayload = {
        id: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const accessToken = this.generateAccessToken(payload);

      return { accessToken };
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  }

  async getMe(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
