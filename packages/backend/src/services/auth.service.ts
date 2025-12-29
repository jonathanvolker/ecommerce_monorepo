import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, PasswordReset } from '../models';
import {
  IRegisterInput,
  ILoginInput,
  IAuthResponse,
  IForgotPasswordInput,
  IResetPasswordInput,
  IChangePasswordInput,
} from '@sexshop/shared';
import { AppError } from '../middlewares/errorHandler';
import { buildResetPasswordEmail, sendMail } from './email.service';

interface TokenPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export class AuthService {
  private resetExpiryMinutes = Number(process.env.RESET_TOKEN_EXP_MIN || 30);

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

  private generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + this.resetExpiryMinutes * 60 * 1000);
    return { token, tokenHash, expiresAt };
  }

  async register(input: IRegisterInput): Promise<IAuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Crear usuario
    const user = await User.create({
      ...input,
      isAdmin: false,
      isActive: true,
    });

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
    // Buscar usuario con password
    const user = await User.findOne({ email: input.email }).select('+password');
    
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new AppError('Usuario inactivo', 403);
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
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

  async requestPasswordReset(input: IForgotPasswordInput): Promise<void> {
    const user = await User.findOne({ email: input.email });
    // No revelar existencia de usuario
    if (!user) return;

    const { token, tokenHash, expiresAt } = this.generateResetToken();

    await PasswordReset.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    const mail = buildResetPasswordEmail(token);
    try {
      await sendMail({
        to: user.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    } catch (err) {
      // No bloquear el flujo si falla el envío de mail
    }
  }

  async resetPassword(input: IResetPasswordInput): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');

    const reset = await PasswordReset.findOne({
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      throw new AppError('Token inválido o expirado', 400);
    }

    const user = await User.findById(reset.user).select('+password');
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    user.password = input.password;
    await user.save();

    reset.usedAt = new Date();
    await reset.save();
  }

  async changePassword(userId: string, input: IChangePasswordInput): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isValid = await user.comparePassword(input.currentPassword);
    if (!isValid) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    user.password = input.newPassword;
    await user.save();
  }
}
