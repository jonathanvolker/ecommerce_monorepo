import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import type { IProduct, IStoreConfig } from '@sexshop/shared';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<IProduct[]>([]);
  const [storeConfig, setStoreConfig] = useState<IStoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [salePage, setSalePage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchData();
    
    // Refrescar productos cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, configRes] = await Promise.all([
        apiClient.get('/products?limit=100&isActive=true'),
        apiClient.get<{ success: boolean; data: IStoreConfig }>('/store-config')
      ]);
      
      const data = productsRes.data?.data || productsRes.data;
      const products = data?.items || data?.products || [];
      
      const featured = products.filter((p: IProduct) => p.featured);
      const onSale = products.filter((p: IProduct) => p.isOnSale);
      
      setFeaturedProducts(featured);
      setOnSaleProducts(onSale);
      setStoreConfig(configRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const totalFeaturedPages = Math.ceil(featuredProducts.length / itemsPerPage);
  const totalSalePages = Math.ceil(onSaleProducts.length / itemsPerPage);

  const getFeaturedPage = () => {
    const start = featuredPage * itemsPerPage;
    return featuredProducts.slice(start, start + itemsPerPage);
  };

  const getSalePage = () => {
    const start = salePage * itemsPerPage;
    return onSaleProducts.slice(start, start + itemsPerPage);
  };

  return (
    <div className="px-3 md:px-0">
      <section className="text-center py-0">
        <div className="flex justify-center mb-0">
          <img 
            src="https://res.cloudinary.com/volkerdev/image/upload/v1689122219/SexySecret/Porfolio_540x540_dv2jrl.png" 
            alt="SexySecret Sex Shop"
            className="w-full md:w-4/5 max-w-4xl h-auto object-contain"
          />
        </div>
        <p className="text-lg md:text-xl text-gray-400 mb-4 md:mb-8 mt-4">
          {storeConfig?.homeMainText || 'Tu tienda de confianza para productos de calidad +18'}
        </p>
        <Link to="/products" className="btn-primary inline-block">
          Catalogo
        </Link>
      </section>

      {/* Sección de Ofertas */}
      {onSaleProducts.length > 0 && (
        <section className="py-4 md:py-12">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-3 md:mb-8">
            <span className="text-primary">Ofertas</span> Especiales
          </h2>
          <div className="relative">
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              {getSalePage().map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group relative"
                >
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold z-10">
                    OFERTA
                  </div>
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <h3 className="font-semibold mb-1 md:mb-2 line-clamp-2 text-xs md:text-base">{product.name}</h3>
                    <p className="text-primary font-bold text-sm md:text-xl">${product.price?.toLocaleString() || '0'}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Controles del carrusel */}
            {totalSalePages > 1 && (
              <div className="flex justify-center items-center gap-2 md:gap-4 mt-4 md:mt-6">
                <button
                  onClick={() => setSalePage(p => Math.max(0, p - 1))}
                  disabled={salePage === 0}
                  className="btn bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-2 md:px-4 py-1 md:py-2"
                >
                  ← Anterior
                </button>
                <span className="text-gray-400 text-xs md:text-base">
                  {salePage + 1} / {totalSalePages}
                </span>
                <button
                  onClick={() => setSalePage(p => Math.min(totalSalePages - 1, p + 1))}
                  disabled={salePage === totalSalePages - 1}
                  className="btn bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-2 md:px-4 py-1 md:py-2"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-4 md:py-12">
        <h2 className="text-xl md:text-3xl font-bold text-center mb-3 md:mb-8">
          Productos <span className="text-primary">Destacados</span>
        </h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="relative">
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              {getFeaturedPage().map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
                >
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <h3 className="font-semibold mb-1 md:mb-2 line-clamp-2 text-xs md:text-base">{product.name}</h3>
                    <p className="text-primary font-bold text-sm md:text-xl">${product.price?.toLocaleString() || '0'}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Controles del carrusel */}
            {totalFeaturedPages > 1 && (
              <div className="flex justify-center items-center gap-2 md:gap-4 mt-4 md:mt-6">
                <button
                  onClick={() => setFeaturedPage(p => Math.max(0, p - 1))}
                  disabled={featuredPage === 0}
                  className="btn bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-2 md:px-4 py-1 md:py-2"
                >
                  ← Anterior
                </button>
                <span className="text-gray-400 text-xs md:text-base">
                  {featuredPage + 1} / {totalFeaturedPages}
                </span>
                <button
                  onClick={() => setFeaturedPage(p => Math.min(totalFeaturedPages - 1, p + 1))}
                  disabled={featuredPage === totalFeaturedPages - 1}
                  className="btn bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-2 md:px-4 py-1 md:py-2"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay productos destacados aún. Marca algunos desde el panel de administración.</p>
        )}
      </section>
    </div>
  );
}
