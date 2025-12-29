import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/axios';
import { Link } from 'react-router-dom';

const schema = z
  .object({
    currentPassword: z.string().min(6, 'Min 6 caracteres'),
    newPassword: z.string().min(6, 'Min 6 caracteres'),
    confirm: z.string(),
  })
  .refine((data) => data.newPassword === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Contraseña actualizada');
      reset();
    } catch (error) {
      toast.error('No se pudo cambiar la contraseña');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cambiar contraseña</h1>
        <Link to="/profile" className="text-primary hover:text-primary-light text-sm">
          Volver al perfil
        </Link>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 shadow-md space-y-4">
        <p className="text-sm text-gray-400">
          Por seguridad, ingresa tu contraseña actual y define una nueva.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña actual</label>
            <input type="password" className="input w-full" {...register('currentPassword')} />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
            <input type="password" className="input w-full" {...register('newPassword')} />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Repetir contraseña</label>
            <input type="password" className="input w-full" {...register('confirm')} />
            {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
