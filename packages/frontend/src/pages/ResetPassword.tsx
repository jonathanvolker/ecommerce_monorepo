import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/axios';

const schema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('Token inválido');
      return;
    }
    try {
      await apiClient.post('/auth/reset-password', { token, password: data.password });
      toast.success('Contraseña actualizada. Inicia sesión.');
      reset();
      navigate('/login');
    } catch (err) {
      toast.error('No se pudo actualizar la contraseña');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4">
        <p className="text-lg">El enlace no es válido.</p>
        <Link to="/forgot-password" className="text-primary">Solicitar uno nuevo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Restablecer <span className="text-primary">contraseña</span>
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
          <input
            type="password"
            className="input w-full"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Repetir contraseña</label>
          <input
            type="password"
            className="input w-full"
            placeholder="••••••••"
            {...register('confirm')}
          />
          {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
}
