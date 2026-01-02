import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import { cacheService } from '@/lib/cache';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import type { IProduct } from '@sexshop/shared';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async (forceRefresh = false) => {
    if (!id) return;
    const cacheKey = `product:${id}`;
    const useCache = !forceRefresh;
    const cached = useCache ? cacheService.get<IProduct>(cacheKey) : null;

    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/products/${id}`);
      const product = response.data?.data || response.data;
      setProduct(product);
      cacheService.set(cacheKey, product, 10 * 60 * 1000);
    } catch (error: unknown) {
      toast.error('Producto no encontrado');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || '',
    });
    toast.success('Producto agregado al carrito');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-400">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div>
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 md:mb-6 transition-colors"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm md:text-base">Volver</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
      {/* Galería de imágenes */}
      <div>
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-2 md:mb-4">
          <div className="aspect-square max-h-[45vh] md:max-h-[60vh] mx-auto">
          {product.images.length > 0 ? (
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              Sin imagen
            </div>
          )}
          </div>
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-5 md:grid-cols-4 gap-1 md:gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-primary'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="pb-24 lg:pb-0">
        <h1 className="text-lg md:text-4xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl md:text-3xl font-bold text-primary mb-3">${product.price.toLocaleString()}</p>

        {/* Stock info - más visible */}
        <div className="bg-gray-800 p-2 md:p-3 rounded-lg mb-2 md:mb-4">
          <p className="text-xs md:text-sm text-gray-300">
            Stock: <span className="text-white font-semibold">{product.stock} unidades</span>
          </p>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-yellow-500 text-xs md:text-sm mt-0.5">¡Últimas unidades!</p>
          )}
        </div>

        {product.description && (
          <div className="mb-2 md:mb-4">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center justify-between w-full text-left py-2 md:py-0 md:mb-2 hover:text-primary transition-colors"
            >
              <h2 className="text-sm md:text-xl font-semibold">Descripción</h2>
              <svg
                className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                  showDescription ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDescription && (
              <p className="text-gray-400 whitespace-pre-line text-xs md:text-base leading-relaxed">{product.description}</p>
            )}
          </div>
        )}

        {Object.keys(product.specifications).length > 0 && (
          <details className="mb-2 md:mb-4">
            <summary className="text-sm md:text-xl font-semibold py-2 md:py-0 md:mb-2 cursor-pointer hover:text-primary transition-colors list-none flex items-center justify-between">
              Especificaciones
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <dl className="space-y-1 text-xs md:text-base mt-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex">
                  <dt className="font-medium text-gray-400 w-1/3">{key}:</dt>
                  <dd className="text-white w-2/3">{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        {product.stock > 0 ? (
          <div className="fixed bottom-0 left-0 right-0 lg:static bg-gray-900 lg:bg-transparent p-3 lg:p-0 border-t lg:border-t-0 border-gray-700 space-y-2 md:space-y-4 shadow-2xl lg:shadow-none z-20">
            <div className="flex items-center justify-between">
              <label className="text-xs md:text-sm font-medium">Cantidad:</label>
              <div className="flex items-center space-x-2 md:space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn bg-gray-800 hover:bg-gray-700 w-9 h-9 md:w-12 md:h-12 text-lg md:text-xl flex items-center justify-center rounded-full"
                >
                  -
                </button>
                <span className="text-lg md:text-xl font-semibold w-8 md:w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="btn bg-gray-800 hover:bg-gray-700 w-9 h-9 md:w-12 md:h-12 text-lg md:text-xl flex items-center justify-center rounded-full"
                >
                  +
                </button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="btn btn-primary w-full text-base md:text-lg py-3 md:py-4 font-bold shadow-xl">
              🛒 Agregar al Carrito
            </button>
          </div>
        ) : (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-500 px-4 md:px-6 py-3 md:py-4 rounded-lg text-center">
            <p className="font-bold text-base md:text-lg">PRODUCTO AGOTADO</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
