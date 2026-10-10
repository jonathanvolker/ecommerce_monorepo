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
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-700 text-xs text-gray-400 font-semibold px-2">
            <div className="col-span-1"></div>
            <div className="col-span-5">Producto</div>
            <div className="col-span-2 text-right">Precio</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-6">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div key={item.productId} className="bg-gray-900 rounded-lg p-3 border border-gray-800 hover:border-primary/40 transition-colors">
                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    {/* Imagen */}
                    <div className="col-span-1">
                      <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            -
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nombre */}
                    <div className="col-span-5">
                      <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    </div>

                    {/* Precio unitario */}
                    <div className="col-span-2 text-right">
                      <span className="text-sm">${item.price.toLocaleString()}</span>
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-center gap-1 bg-gray-800 rounded w-fit mx-auto px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="text-gray-400 hover:text-primary text-xs font-bold w-5 h-5 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="text-gray-400 hover:text-primary text-xs font-bold w-5 h-5 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total y eliminar */}
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <span className="text-primary font-bold text-sm">${itemTotal.toLocaleString()}</span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:text-red-400 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden space-y-2">
                    <div className="flex gap-3">
                      {/* Imagen mobile */}
                      <div className="w-20 h-20 bg-gray-800 rounded flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            -
                          </div>
                        )}
                      </div>

                      {/* Info mobile */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                          <p className="text-primary font-bold text-base">${item.price.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:text-red-400 text-xs w-fit"
                        >
                          Eliminar
                        </button>
                      </div>

                      {/* Cantidad mobile */}
                      <div className="flex flex-col items-center justify-between">
                        <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="text-gray-400 hover:text-primary text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="text-gray-400 hover:text-primary text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-primary font-bold text-sm">${itemTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vaciar carrito link */}
          <button
            onClick={clearCart}
            className="text-gray-500 hover:text-red-500 text-xs font-medium transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-6 sticky top-4 space-y-4">
            <h2 className="text-2xl font-bold">Resumen</h2>

            <div className="space-y-3 py-4 border-y border-gray-700">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={handleCheckout} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-base"
              >
                {user ? '✓ Finalizar Compra' : 'Iniciar Sesión para Comprar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
