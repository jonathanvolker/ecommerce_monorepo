import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/axios';
import { cacheService } from '@/lib/cache';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import type { IStoreConfig, ShippingMethod } from '@sexshop/shared';

const checkoutSchema = z.object({
  shippingMethod: z.enum(['PICKUP', 'VIA_CARGO', 'CORREO_ARGENTINO']),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().min(10, 'Teléfono inválido'),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.shippingMethod !== 'PICKUP') {
    return !!(data.address && data.city && data.province && data.postalCode);
  }
  return true;
}, {
  message: 'Todos los campos de dirección son requeridos para envíos',
  path: ['address'],
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [storeConfig, setStoreConfig] = useState<IStoreConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [savedOrderData, setSavedOrderData] = useState<{
    items: typeof items;
    subtotal: number;
    shippingMethod: ShippingMethod;
    shippingCost: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'PICKUP',
    },
  });

  const shippingMethod = watch('shippingMethod');
  const needsAddress = shippingMethod !== 'PICKUP';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchStoreConfig();
  }, [user, items.length, navigate]);

  const fetchStoreConfig = async (forceRefresh = false) => {
    const useCache = !forceRefresh;
    const cachedConfig = useCache ? cacheService.get<IStoreConfig>('store-config') : null;

    if (cachedConfig) {
      setStoreConfig(cachedConfig);
      return;
    }

    try {
      const response = await apiClient.get('/store-config');
      const config = response.data?.data || response.data;
      setStoreConfig(config);
      cacheService.set('store-config', config, 10 * 60 * 1000);
    } catch (error) {
      toast.error('Error al cargar configuración de la tienda');
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (step === 'shipping') {
      setStep('payment');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingMethod: data.shippingMethod as ShippingMethod,
        shippingAddress: needsAddress
          ? {
              address: data.address || '',
              city: data.city || '',
              province: data.province || '',
              postalCode: data.postalCode || '',
              phone: data.phone,
              notes: data.notes,
            }
          : undefined,
        notes: data.notes,
        shippingCost: getShippingCost(),
      };

      const response = await apiClient.post('/orders', orderData);
      const order = response.data?.data || response.data;
      setOrderId(order._id);
      
      // Guardar datos para WhatsApp
      setSavedOrderData({
        items: [...items],
        subtotal: getTotalAmount(),
        shippingMethod: data.shippingMethod as ShippingMethod,
        shippingCost: getShippingCost()
      });
      
      setShowSuccessModal(true);
    } catch (error: unknown) {
      toast.error('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const getShippingCost = () => {
    if (!storeConfig?.shippingCosts || shippingMethod === 'PICKUP') return 0;
    return storeConfig.shippingCosts[shippingMethod] || 0;
  };

  const total = getTotalAmount() + getShippingCost();

  const shareOnWhatsApp = () => {
    if (!storeConfig || !savedOrderData) return;
    
    const itemsList = savedOrderData.items
      .map((item) => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`)
      .join('\n');
    
    const shippingMethodText = savedOrderData.shippingMethod === 'PICKUP' 
      ? 'Retiro en local' 
      : savedOrderData.shippingMethod === 'VIA_CARGO' 
        ? 'Vía Cargo' 
        : 'Correo Argentino';
    
    const shippingLine = savedOrderData.shippingCost > 0 
      ? `Envío (${shippingMethodText}): $${savedOrderData.shippingCost.toLocaleString()}\n` 
      : savedOrderData.shippingMethod !== 'PICKUP'
        ? `Envío (${shippingMethodText}): A convenir\n`
        : '';
    
    const total = savedOrderData.subtotal + savedOrderData.shippingCost;
    
    const message = `¡Hola SexySecret!\nAcabo de realizar un pedido #${orderId.slice(-8).toUpperCase()}\n\nProductos:\n${itemsList}\n\nSubtotal: $${savedOrderData.subtotal.toLocaleString()}\n${shippingLine}Total: $${total.toLocaleString()}\n\nMétodo de envío: ${shippingMethodText}\n\nGracias por tu compra!`;
    
    const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    navigate('/profile');
  };

  if (!storeConfig) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">
        <span className="text-primary">Finalizar</span> Compra
      </h1>

      <div className="mb-8 flex justify-center">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'shipping' ? 'bg-primary text-black' : 'bg-gray-700'
            }`}
          >
            1
          </div>
          <div className="w-24 h-1 bg-gray-700"></div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-primary text-black' : 'bg-gray-700'
            }`}
          >
            2
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {step === 'shipping' ? (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Datos de Envío</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Método de Envío</label>
                <select {...register('shippingMethod')} className="input w-full">
                  <option value="PICKUP">Retiro en Local (Gratis)</option>
                  <option value="VIA_CARGO">
                    Vía Cargo {storeConfig?.shippingCosts?.VIA_CARGO ? `($${storeConfig.shippingCosts.VIA_CARGO})` : '(A acordar)'}
                  </option>
                  <option value="CORREO_ARGENTINO">
                    Correo Argentino {storeConfig?.shippingCosts?.CORREO_ARGENTINO ? `($${storeConfig.shippingCosts.CORREO_ARGENTINO})` : '(A acordar)'}
                  </option>
                </select>
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span>Subtotal productos:</span>
                    <span className="text-right">${getTotalAmount().toLocaleString()}</span>
                  </div>
                  {getShippingCost() > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <span>Envío:</span>
                      <span className="text-right">${getShippingCost().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-lg font-bold mt-2 pt-2 border-t border-gray-600">
                    <span>Total:</span>
                    <span className="text-right text-primary">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {needsAddress && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Dirección *</label>
                    <input {...register('address')} className="input w-full" placeholder="Calle y número" />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ciudad *</label>
                      <input {...register('city')} className="input w-full" />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Provincia *</label>
                      <input {...register('province')} className="input w-full" />
                      {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Código Postal *</label>
                    <input {...register('postalCode')} className="input w-full" />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Teléfono de Contacto *</label>
                <input {...register('phone')} className="input w-full" placeholder="+54 9 11 1234-5678" />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas Adicionales</label>
                <textarea {...register('notes')} className="input w-full" rows={3} placeholder="Información adicional sobre tu pedido..."></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6">
              Continuar al Pago
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Información de pago */}
            <div className="bg-gradient-to-r from-primary to-pink-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">💳 Información de Pago</h2>
              <p className="mb-4">Realiza tu transferencia a la siguiente cuenta:</p>

              <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">CBU:</span>
                  <span className="font-mono">{storeConfig.bankDetails.cbu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Alias:</span>
                  <span className="font-mono">{storeConfig.bankDetails.alias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Titular:</span>
                  <span>{storeConfig.bankDetails.accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Banco:</span>
                  <span>{storeConfig.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-white border-opacity-30">
                  <span>Monto a transferir:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-primary">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {getShippingCost() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Envío ({shippingMethod === 'VIA_CARGO' ? 'Vía Cargo' : 'Correo Argentino'})</span>
                    <span className="text-primary">${getShippingCost().toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-yellow-400">📋 Instrucciones:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                <li>Realiza la transferencia por el monto indicado</li>
                <li>Guarda el comprobante de transferencia</li>
                <li>Confirma tu pedido haciendo clic en &quot;Confirmar Pedido&quot;</li>
                <li>Un administrador verificará tu pago y confirmará tu orden</li>
                <li>Recibirás actualizaciones del estado en tu perfil</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep('shipping')} className="btn bg-gray-700 hover:bg-gray-600 flex-1">
                Volver
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>

            <button type="button" onClick={shareOnWhatsApp} className="btn bg-green-600 hover:bg-green-700 w-full">
              📱 Compartir por WhatsApp
            </button>
          </div>
        )}
      </form>

      {/* Resumen lateral en paso 1 */}
      {step === 'shipping' && (
        <div className="bg-gray-900 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">Resumen</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="text-primary">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 md:p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Pedido Creado!</h2>
              <p className="text-gray-400 mb-6">
                Tu pedido #{orderId.slice(-8).toUpperCase()} ha sido creado exitosamente.
              </p>
              <p className="text-sm text-gray-300 mb-6">
                Para coordinar el pago y confirmar tu pedido, comunícate con nosotros por WhatsApp.
              </p>
              <div className="space-y-3">
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Escribir a SexySecret
                </button>
                <button
                  onClick={() => {
                    clearCart();
                    navigate('/profile');
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Ver mis pedidos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
