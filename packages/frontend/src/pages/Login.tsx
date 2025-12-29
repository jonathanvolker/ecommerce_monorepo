import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/axios';
import type { IAuthResponse } from '@sexshop/shared';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('[LOGIN] Intentando login con:', data.email);
      const response = await apiClient.post<{ success: boolean; data: IAuthResponse }>('/auth/login', data);
      console.log('[LOGIN] Respuesta exitosa:', response.data);
      const { user, accessToken } = response.data.data;
      
      login(user, accessToken);
      
      toast.success(`¡Bienvenido ${user.firstName}!`);
      
      navigate(redirectTo);
    } catch (error: unknown) {
      console.error('[LOGIN] Error:', error);
      toast.error('Error al iniciar sesión');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        <span className="text-primary">Iniciar</span> Sesión
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="input w-full"
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Contraseña
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="input w-full"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
          <div className="text-right mt-2">
            <Link to="/forgot-password" className="text-primary hover:text-primary-light text-sm">
              Olvidé mi contraseña
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link to={`/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`} className="text-primary hover:text-primary-light">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
