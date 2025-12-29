import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import type { IOrder } from '@sexshop/shared';

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

const shippingLabels: Record<string, string> = {
  PICKUP: 'Retiro en Local',
  VIA_CARGO: 'Via Cargo',
  CORREO_ARGENTINO: 'Correo Argentino',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders/my-orders');
      const orders = response.data?.data?.items || response.data?.items || response.data || [];
      setOrders(orders);
      setCurrentPage(1);
    } catch (error: unknown) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (orderDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (orderDate > to) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      logout();
      toast.success('Sesión cerrada');
      navigate('/');
    } catch (error) {
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Mi <span className="text-primary">Perfil</span>
        </h1>
        <button onClick={handleLogout} className="btn bg-red-900 hover:bg-red-800">
          Cerrar Sesión
        </button>
      </div>

      {/* Información del usuario */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Nombre</p>
            <p className="font-semibold">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          {user.isAdmin && (
            <div className="col-span-2">
              <span className="bg-primary text-black px-3 py-1 rounded-full text-sm font-bold">ADMINISTRADOR</span>
            </div>
          )}
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Cambiar contraseña</h2>
          <p className="text-gray-400 text-sm">Gestiona tu contraseña.</p>
        </div>
        <Link to="/change-password" className="btn btn-primary w-full md:w-auto text-center">
          Cambiar contraseña
        </Link>
      </div>

      {/* Historial de pedidos */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Mis Pedidos</h2>

        {/* Filtros de fecha */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Desde</label>
              <DatePicker
                selected={dateFrom ? new Date(dateFrom) : null}
                onChange={(date) => {
                  setDateFrom(date ? date.toISOString().split('T')[0] : '');
                  setCurrentPage(1);
                }}
                className="input w-full"
                placeholderText="Seleccionar fecha"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hasta</label>
              <DatePicker
                selected={dateTo ? new Date(dateTo) : null}
                onChange={(date) => {
                  setDateTo(date ? date.toISOString().split('T')[0] : '');
                  setCurrentPage(1);
                }}
                className="input w-full"
                placeholderText="Seleccionar fecha"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setCurrentPage(1);
                }}
                className="btn bg-gray-700 hover:bg-gray-600 w-full"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
          {filteredOrders.length > 0 && (
            <p className="text-sm text-gray-400 mt-3">
              Mostrando {paginatedOrders.length} de {filteredOrders.length} pedidos
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No tienes pedidos aún</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Comenzar a Comprar
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No hay pedidos en el rango de fechas seleccionado</p>
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }}
              className="btn btn-primary"
            >
              Ver todos los pedidos
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
              <div key={order._id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Pedido #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                    <p className="text-sm mt-1">
                      Estado: <span className="text-primary font-semibold">{statusLabels[order.orderStatus] || order.orderStatus || 'Pendiente'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items
                    .filter((item) => (Number(item.price) || 0) * (Number(item.quantity) || 0) > 0)
                    .map((item, index) => {
                      const qty = Number(item.quantity) || 0;
                      const unit = Number(item.price) || 0;
                      const total = unit * qty;
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {item.name} x{qty}
                          </span>
                          <span className="text-white">${total.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  {order.shippingMethod === 'PICKUP' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Envío</span>
                      <span className="text-white">Retiro en Local</span>
                    </div>
                  )}
                  {order.shippingMethod !== 'PICKUP' && (order.shippingCost ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Envío ({order.shippingMethod === 'VIA_CARGO' ? 'Vía Cargo' : order.shippingMethod === 'CORREO_ARGENTINO' ? 'Correo Argentino' : 'Retiro en local'})
                      </span>
                      <span className="text-white">${order.shippingCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
                  <div></div>
                  <div className="text-right md:text-right flex flex-col items-end">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-xl font-bold text-primary">${order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {order.adminNotes && (
                  <div className="mt-4 bg-gray-800 rounded p-3">
                    <p className="text-sm text-gray-400 mb-1">Nota del administrador:</p>
                    <p className="text-sm">{order.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded ${
                        currentPage === page
                          ? 'bg-primary text-black font-bold'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
