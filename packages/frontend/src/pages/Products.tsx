import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import { cacheService } from '@/lib/cache';
import toast from 'react-hot-toast';
import type { IProduct, ICategory } from '@sexshop/shared';

interface ProductsResponse {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados locales para los filtros (sin aplicar hasta hacer clic en "Aplicar")
  const [localSearch, setLocalSearch] = useState('');
  const [localMinPrice, setLocalMinPrice] = useState('');
  const [localMaxPrice, setLocalMaxPrice] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [localSortBy, setLocalSortBy] = useState('');
  
  // Leer filtros aplicados desde URL
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '';

  // Sincronizar estados locales con URL al montar
  useEffect(() => {
    setLocalSearch(search);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalCategory(category);
    setLocalSortBy(sortBy);
  }, []);

  // Función para aplicar filtros
  const applyFilters = () => {
    const newParams = new URLSearchParams();
    if (localSearch) newParams.set('search', localSearch);
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    if (localSortBy) newParams.set('sortBy', localSortBy);
    if (localCategory) newParams.set('category', localCategory);
    newParams.set('page', '1'); // Reset a página 1
    
    setSearchParams(newParams, { replace: true });
    setShowFilters(false); // Cerrar filtros en mobile
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSortBy('');
    setLocalCategory('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Función helper para actualizar parámetros (para paginación)
  const updateParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, minPrice, maxPrice, category, sortBy, page]);

  const fetchCategories = async () => {
    try {
      // Intentar obtener del cache primero
      const cached = cacheService.get<ICategory[]>('categories');
      if (cached) {
        setCategories(cached);
        return;
      }
      
      // Usar el nuevo endpoint optimizado
      const response = await apiClient.get('/categories/list');
      const data = response.data?.data || [];
      
      setCategories(data);
      // Cachear por 10 minutos
      cacheService.set('categories', data, 600000);
    } catch (error: unknown) {
      console.error('Error al cargar categorías');
    }
  };

  const fetchProducts = async (forceRefresh = false) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (sortBy) params.append('sortBy', sortBy);
    if (category) params.append('category', category);
    params.append('isActive', 'true');
    params.append('page', page.toString());
    params.append('limit', '6'); // 6 productos por página (2 filas de 3)

    const cacheKey = `products:list:${params.toString()}`;
    const useCache = !forceRefresh;
    const cached = useCache ? cacheService.get<{ items: IProduct[]; totalPages: number }>(cacheKey) : null;

    if (cached) {
      setProducts(cached.items);
      setTotalPages(cached.totalPages);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/products?${params.toString()}`);
      const data = response.data?.data || response.data;
      const products = data?.items || data?.products || [];
      const totalPagesFromApi = data?.totalPages || 1;
      setProducts(products);
      setTotalPages(totalPagesFromApi);
      cacheService.set(cacheKey, { items: products, totalPages: totalPagesFromApi }, 5 * 60 * 1000);
    } catch (error: unknown) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl md:text-4xl font-bold mb-4 md:mb-8">
        <span className="text-primary">Catálogo</span> de Productos
      </h1>

      {/* Botón para mostrar filtros en mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden w-full bg-gray-800 text-gray-200 py-2.5 rounded-lg mb-3 flex items-center justify-center gap-2 font-medium border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm">{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
      </button>

      {/* Filtros */}
      <div className={`bg-gray-900 p-3 md:p-6 rounded-lg mb-4 md:mb-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Categoría</label>
            <select
              className="input w-full text-xs md:text-sm"
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Ordenar por</label>
            <select
              className="input w-full text-xs md:text-sm"
              value={localSortBy}
              onChange={(e) => setLocalSortBy(e.target.value)}
            >
              <option value="">Sin ordenar</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Buscar</label>
            <input
              type="text"
              className="input w-full text-xs md:text-sm"
              placeholder="Buscar productos..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          {/* Precios en paralelo */}
          <div className="grid grid-cols-2 gap-2 md:col-span-2">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Precio Mín</label>
              <input
                type="number"
                className="input w-full text-xs md:text-sm"
                placeholder="$0"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Precio Máx</label>
              <input
                type="number"
                className="input w-full text-xs md:text-sm"
                placeholder="$999999"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={applyFilters}
            className="px-6 md:px-8 bg-gray-700 text-white py-2 md:py-2.5 rounded-lg hover:bg-gray-600 transition-all font-medium text-xs md:text-sm border border-gray-600 hover:border-gray-500 active:scale-[0.98]"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={clearFilters}
            className="px-4 md:px-6 bg-gray-800 text-gray-300 py-2 md:py-2.5 rounded-lg hover:bg-gray-700 transition-all font-medium text-xs md:text-sm border border-gray-700 hover:border-gray-600 active:scale-[0.98]"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Carrusel de productos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-400">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No se encontraron productos</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {/* Fila 1: 3 productos */}
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {products.slice(0, 3).map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group relative"
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
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                      <span className="text-red-500 font-bold text-xs md:text-xl">AGOTADO</span>
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-4">
                  <h3 className="font-semibold mb-1 md:mb-2 line-clamp-2 text-xs md:text-base">{product.name}</h3>
                  <p className="text-primary font-bold text-sm md:text-xl">${product.price?.toLocaleString() || '0'}</p>
                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-yellow-500 text-xs mt-1">¡Últimas!</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          {/* Fila 2: 3 productos */}
          {products.length > 3 && (
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              {products.slice(3, 6).map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group relative"
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
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-xs md:text-xl">AGOTADO</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <h3 className="font-semibold mb-1 md:mb-2 line-clamp-2 text-xs md:text-base">{product.name}</h3>
                    <p className="text-primary font-bold text-sm md:text-xl">${product.price?.toLocaleString() || '0'}</p>
                    {product.stock > 0 && product.stock <= 5 && (
                      <p className="text-yellow-500 text-xs mt-1">¡Últimas!</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paginación */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-6 md:mt-10">
          <button
            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
            disabled={page === 1}
            className="btn bg-gray-800 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-3 md:px-6 py-2 md:py-3 rounded-full"
          >
            ← Anterior
          </button>
          <div className="flex items-center gap-1 md:gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => updateParams({ page: pageNum })}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    page === pageNum
                      ? 'bg-primary text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
            disabled={page === totalPages}
            className="btn bg-gray-800 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-3 md:px-6 py-2 md:py-3 rounded-full"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
