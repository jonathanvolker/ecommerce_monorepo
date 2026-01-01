import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { IProduct, ICategory, ApiResponse, PaginatedResponse } from '@sexshop/shared';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6; // 2 filas de 3 productos
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    featured: false,
    isOnSale: false,
    isActive: false,
    images: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get<ApiResponse<PaginatedResponse<IProduct>>>('/products?limit=1000'),
        apiClient.get<ApiResponse<ICategory[]>>('/categories')
      ]);
      
      if (productsRes.data.success && productsRes.data.data) {
        setProducts(productsRes.data.data.items);
      } else {
        setProducts([]);
      }
      
      if (categoriesRes.data.success && categoriesRes.data.data) {
        setCategories(categoriesRes.data.data);
      } else {
        setCategories([]);
      }
    } catch (error: unknown) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const response = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        // El backend devuelve { success: true, url: "..." }
        const url = response.data.url || response.data.data?.url;
        if (url) {
          uploadedUrls.push(url);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
        
      // Resetear el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success(`${uploadedUrls.length} imagen(es) subida(s) correctamente`);
    } catch (error: unknown) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al subir imagen');
      
      // Resetear el input file incluso si falla
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        featured: formData.featured,
        isOnSale: formData.isOnSale,
        isActive: formData.isActive,
        images: formData.images,
        specifications: {},
      };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, productData);
        toast.success('Producto actualizado');
      } else {
        await apiClient.post('/products', productData);
        toast.success('Producto creado');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: unknown) {
      toast.error('Error al guardar producto');
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '0',
      stock: product.stock?.toString() || '0',
      category: typeof product.category === 'object' ? product.category._id : product.category || '',
      featured: product.featured || false,
      isOnSale: product.isOnSale || false,
      isActive: product.isActive || false,
      images: product.images || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      featured: false,
      isOnSale: false,
      isActive: false,
      images: [],
    });
    setEditingProduct(null);
    setIsNewCategory(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, descripción o categoría..."
          className="input w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de productos con carrusel */}
      {(() => {
        const filteredProducts = products.filter((product) => {
          if (!searchTerm) return true;
          const search = searchTerm.toLowerCase();
          return (
            product.name?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search) ||
            (typeof product.category === 'string' 
              ? product.category.toLowerCase().includes(search)
              : product.category?.name?.toLowerCase().includes(search)) ||
            product._id?.toLowerCase().includes(search)
          );
        });
        
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        const currentProducts = filteredProducts.slice(
          currentPage * itemsPerPage,
          (currentPage + 1) * itemsPerPage
        );

        return (
          <>
            <div className="space-y-3 md:space-y-4 mb-6">
              {/* Fila 1 */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {currentProducts.slice(0, 3).map((product) => (
                  <div key={product._id} className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-800 overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <h3 className="font-semibold mb-1 line-clamp-1 text-xs md:text-sm">{product.name}</h3>
                      <p className="text-primary font-bold mb-1 text-sm md:text-base">${product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mb-2">Stock: {product.stock}</p>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(product)} className="btn bg-blue-900 hover:bg-blue-800 flex-1 text-xs py-1">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="btn bg-red-900 hover:bg-red-800 flex-1 text-xs py-1">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fila 2 */}
              {currentProducts.length > 3 && (
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {currentProducts.slice(3, 6).map((product) => (
                    <div key={product._id} className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-800 overflow-hidden">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>
                        )}
                      </div>
                      <div className="p-2 md:p-3">
                        <h3 className="font-semibold mb-1 line-clamp-1 text-xs md:text-sm">{product.name}</h3>
                        <p className="text-primary font-bold mb-1 text-sm md:text-base">${product.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mb-2">Stock: {product.stock}</p>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(product)} className="btn bg-blue-900 hover:bg-blue-800 flex-1 text-xs py-1">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="btn bg-red-900 hover:bg-red-800 flex-1 text-xs py-1">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 md:gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="btn bg-gray-800 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-3 md:px-6 py-2 md:py-3 rounded-full"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-1 md:gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage <= 2) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-xs md:text-sm font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="btn bg-gray-800 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base px-3 md:px-6 py-2 md:py-3 rounded-full"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg w-full max-w-md md:max-w-lg my-4 max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3 flex justify-between items-center rounded-t-lg">
              <h3 className="text-base md:text-2xl font-bold">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none p-1">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="input w-full text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">Descripción</label>
                <textarea
                  className="input w-full text-sm"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Precio *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input w-full text-sm"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input w-full text-sm"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs md:text-sm font-medium">Categoría *</label>
                  <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={isNewCategory}
                      onChange={(e) => {
                        setIsNewCategory(e.target.checked);
                        if (e.target.checked) {
                          setFormData({ ...formData, category: '' });
                        }
                      }}
                    />
                    Nueva
                  </label>
                </div>
                {isNewCategory ? (
                  <input
                    type="text"
                    required
                    className="input w-full text-sm"
                    placeholder="Nombre de la nueva categoría"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                ) : (
                  <select
                    required
                    className="input w-full text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 text-xs">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="featured"
                    className="mr-1.5"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Destacado</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isOnSale"
                    className="mr-1.5"
                    checked={formData.isOnSale}
                    onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                  />
                  <span>En oferta</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="mr-1.5"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Activo</span>
                </label>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">Imágenes</label>
                <p className="text-xs text-gray-500 mb-2">Total: {formData.images.length} imagen(es)</p>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded overflow-hidden bg-gray-800">
                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" onError={(e) => {
                          console.error('❌ Error cargando imagen:', url);
                          // Evitar loop infinito: solo cambiar si no es ya un placeholder
                          if (!e.currentTarget.src.includes('placeholder')) {
                            e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                          }
                        }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="btn bg-gray-800 hover:bg-gray-700 w-full text-xs cursor-pointer text-center py-2">
                  {uploading ? 'Subiendo...' : '📷 Elegir archivos'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-0.5">Puedes seleccionar múltiples imágenes</p>
              </div>
            </form>

            <div className="flex-shrink-0 flex gap-2 p-3 bg-gray-900 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn bg-gray-700 hover:bg-gray-600 flex-1 text-sm py-2"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={uploading} 
                className="btn btn-primary flex-1 text-sm font-semibold py-2"
                onClick={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget.closest('div')?.previousElementSibling as HTMLFormElement;
                  form?.requestSubmit();
                }}
              >
                {editingProduct ? '💾' : '✨'} {editingProduct ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
