import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function Cart() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { items, updateQuantity, removeItem, getTotalAmount, clearCart } = useCartStore();

  const total = getTotalAmount();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-400 mb-8">Agrega productos para comenzar tu compra</p>
        <Link to="/products" className="btn btn-primary">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        <span className="text-primary">Carrito</span> de Compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-gray-900 rounded-lg p-4 flex gap-4">
              <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold mb-2">{item.name}</h3>
                <p className="text-primary font-bold">${item.price.toLocaleString()}</p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  Eliminar
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    className="btn bg-gray-800 hover:bg-gray-700 w-8 h-8 text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="btn bg-gray-800 hover:bg-gray-700 w-8 h-8 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Resumen</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Productos ({items.length})</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary w-full mb-3">
              {user ? 'Finalizar Compra' : 'Iniciar Sesión para Comprar'}
            </button>

            <button onClick={clearCart} className="btn bg-red-900 hover:bg-red-800 w-full text-sm">
              Vaciar Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
