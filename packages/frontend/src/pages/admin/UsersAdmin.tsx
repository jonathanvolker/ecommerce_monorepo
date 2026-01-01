import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { IUserWithStats, IOrder } from '@sexshop/shared';

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de Pago',
  PAYMENT_CONFIRMED: 'Pago Confirmado',
  PREPARING: 'En Preparación',
  READY_FOR_PICKUP: 'Listo para Retiro',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-900 text-yellow-300',
  PAYMENT_CONFIRMED: 'bg-blue-900 text-blue-300',
  PREPARING: 'bg-purple-900 text-purple-300',
  READY_FOR_PICKUP: 'bg-green-900 text-green-300',
  SHIPPED: 'bg-cyan-900 text-cyan-300',
  DELIVERED: 'bg-green-900 text-green-300',
  CANCELLED: 'bg-red-900 text-red-300',
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<IUserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<IUserWithStats | null>(null);
  const [userOrders, setUserOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    isAdmin: false,
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (roleFilter !== 'all') {
        params.append('isAdmin', roleFilter === 'admin' ? 'true' : 'false');
      }

      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      }

      const response = await apiClient.get(`/users?${params.toString()}`);
      const data = response.data?.data || response.data;
      
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: IUserWithStats) => {
    setSelectedUser(user);
    setEditFormData({
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    });
    setIsEditing(false);
    setExpandedOrderId(null);

    // Cargar pedidos del usuario
    setLoadingOrders(true);
    try {
      const response = await apiClient.get(`/users/${user._id}/orders?limit=50`);
      const data = response.data?.data || response.data;
      setUserOrders(data.orders || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar historial de pedidos');
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.patch(`/users/${selectedUser._id}`, editFormData);
      toast.success('Usuario actualizado correctamente');
      setIsEditing(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al actualizar usuario';
      toast.error(message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6">Gestión de Usuarios</h2>

      {/* Filtros - Colapsable en mobile */}
      <div className="bg-gray-900 rounded-lg p-3 md:p-4 mb-6">
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium mb-2">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full text-sm"
            >
              <option value="all">Todos</option>
              <option value="admin">Administradores</option>
              <option value="user">Clientes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla para desktop */}
      <div className="hidden md:block bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Pedidos</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Total Gastado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.isAdmin
                          ? 'bg-purple-900 text-purple-300'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {user.isAdmin ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{user.totalOrders}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {formatCurrency(user.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación Desktop */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-800">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary px-3 py-1 disabled:opacity-50 text-sm"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary px-3 py-1 disabled:opacity-50 text-sm"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Cards para mobile */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => handleUserClick(user)}
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  user.isAdmin
                    ? 'bg-purple-900 text-purple-300'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {user.isAdmin ? 'Admin' : 'Cliente'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div>
                <p className="text-gray-400">Estado</p>
                <span
                  className={`px-2 py-1 rounded inline-block font-semibold mt-1 ${
                    user.isActive
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}
                >
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <p className="text-gray-400">Pedidos</p>
                <p className="font-bold text-base mt-1">{user.totalOrders}</p>
              </div>
              <div>
                <p className="text-gray-400">Gastado</p>
                <p className="font-bold text-primary text-sm mt-1">
                  {formatCurrency(user.totalSpent)}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Registro: {formatDate(user.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {/* Paginación Mobile */}
      {totalPages > 1 && (
        <div className="md:hidden flex justify-center items-center gap-2 py-4 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary px-2 py-1 disabled:opacity-50 text-xs"
          >
            ← Anterior
          </button>
          <span className="text-xs text-gray-400">
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary px-2 py-1 disabled:opacity-50 text-xs"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal de detalles del usuario */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen md:max-h-[90vh] overflow-y-auto my-4">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 md:p-6 flex justify-between items-center">
              <h3 className="text-lg md:text-2xl font-bold">Detalles del Usuario</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {/* Información del usuario */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>👤</span> Información Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Nombre Completo</p>
                    <p className="font-medium text-sm md:text-base">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Email</p>
                    <p className="font-medium text-sm md:text-base">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">Fecha de Registro</p>
                    <p className="font-medium text-sm md:text-base">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-400">ID de Usuario</p>
                    <p className="font-mono text-xs text-gray-400 break-all">{selectedUser._id}</p>
                  </div>
                </div>
              </div>

              {/* Gestión del usuario */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 mb-4">
                  <h4 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <span>⚙️</span> Gestión
                  </h4>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary px-4 py-2 text-sm w-full md:w-auto"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2 flex-col md:flex-row">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditFormData({
                            isAdmin: selectedUser.isAdmin,
                            isActive: selectedUser.isActive,
                          });
                        }}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleUpdateUser}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Guardar
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isAdmin}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, isAdmin: e.target.checked }))
                      }
                      disabled={!isEditing}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Es Administrador</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      disabled={!isEditing}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Cuenta Activa</span>
                  </label>
                </div>
              </div>

              {/* Historial de compras */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🛒</span> Historial de Compras
                </h4>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                  <div className="bg-gray-900 rounded p-2 md:p-3 text-center">
                    <p className="text-xs md:text-sm text-gray-400 mb-1">Total Gastado</p>
                    <p className="text-lg md:text-xl font-bold text-primary">
                      {formatCurrency(selectedUser.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-gray-900 rounded p-2 md:p-3 text-center">
                    <p className="text-xs md:text-sm text-gray-400 mb-1">Total Pedidos</p>
                    <p className="text-lg md:text-xl font-bold">{selectedUser.totalOrders}</p>
                  </div>
                  <div className="bg-gray-900 rounded p-2 md:p-3 text-center">
                    <p className="text-xs md:text-sm text-gray-400 mb-1">Último Pedido</p>
                    <p className="text-xs md:text-sm font-medium">
                      {selectedUser.lastOrderDate
                        ? formatDate(selectedUser.lastOrderDate)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Lista de pedidos */}
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : userOrders.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    Este usuario no tiene pedidos aún
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userOrders.map((order) => (
                      <div key={order._id} className="bg-gray-900 rounded-lg overflow-hidden">
                        <div
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order._id ? null : order._id
                            )
                          }
                          className="p-3 md:p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                                <span className="font-mono text-xs md:text-sm text-gray-400">
                                  #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    statusColors[order.orderStatus]
                                  }`}
                                >
                                  {statusLabels[order.orderStatus]}
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-gray-400">
                                {formatDate(order.createdAt)} • {order.items.length}{' '}
                                {order.items.length === 1 ? 'producto' : 'productos'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base md:text-xl font-bold text-primary">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <p className="text-xs md:text-sm text-gray-400">
                                {expandedOrderId === order._id ? '▲' : '▼'} Ver detalles
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detalles expandidos */}
                        {expandedOrderId === order._id && (
                          <div className="border-t border-gray-800 p-3 md:p-4 space-y-2">
                            <h5 className="font-semibold text-sm md:text-base mb-2">Productos:</h5>
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col md:flex-row md:justify-between text-xs md:text-sm py-2 border-b border-gray-800 last:border-0 gap-2"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-gray-400">
                                    Cantidad: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                            {order.shippingAddress && (
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <h5 className="font-semibold mb-2 text-sm md:text-base">Dirección de Envío:</h5>
                                <p className="text-xs md:text-sm text-gray-400">
                                  {order.shippingAddress.address}
                                </p>
                                <p className="text-xs md:text-sm text-gray-400">
                                  {order.shippingAddress.city},{' '}
                                  {order.shippingAddress.province} (CP:{' '}
                                  {order.shippingAddress.postalCode})
                                </p>
                                <p className="text-xs md:text-sm text-gray-400">
                                  Tel: {order.shippingAddress.phone}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
