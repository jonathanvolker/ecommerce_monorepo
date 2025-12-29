import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { ICategory } from '@sexshop/shared';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: ICategory[] }>('/categories');
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory._id}`, { name, description });
        toast.success('Categoría actualizada');
      } else {
        await apiClient.post('/categories', { name, description });
        toast.success('Categoría creada');
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error: unknown) {
      toast.error('Error al guardar categoría');
    }
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch (error: unknown) {
      toast.error('Error al eliminar categoría');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingCategory(null);
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
        <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{category.name}</h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{category.description || 'Sin descripción'}</p>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(category)} className="btn bg-blue-900 hover:bg-blue-800 flex-1 text-sm">
                Editar
              </button>
              <button onClick={() => handleDelete(category._id)} className="btn bg-red-900 hover:bg-red-800 flex-1 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{editingCategory ? 'Editar' : 'Nueva'} Categoría</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn bg-gray-700 hover:bg-gray-600 flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
