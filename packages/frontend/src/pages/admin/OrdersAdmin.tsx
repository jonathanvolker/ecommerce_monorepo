import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { IOrder } from '@sexshop/shared';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders/admin/all');
      const orders = response.data?.data?.items || response.data?.items || response.data || [];
      setOrders(orders);
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ [OrdersAdmin] Error:', error);
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

  const handleOrderClick = (order: IOrder) => {
    setSelectedOrder(order);
    setStatusUpdate(order.orderStatus);
    setShippingCost(order.shippingCost?.toString() || '');
    setAdminNotes(order.adminNotes || '');
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      await apiClient.patch(`/orders/${selectedOrder._id}/status`, {
        status: statusUpdate,
        shippingCost: shippingCost ? Number(shippingCost) : undefined,
        adminNotes: adminNotes || undefined,
      });
      toast.success('Pedido actualizado');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: unknown) {
      toast.error('Error al actualizar pedido');
    }
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
      <h2 className="text-2xl font-bold mb-6">Gestión de Pedidos</h2>

      {/* Filtros de fecha */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Limpiar
            </button>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-gray-400">
              {filteredOrders.length > 0 ? `${paginatedOrders.length} de ${filteredOrders.length}` : 'Sin resultados'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">No hay pedidos</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">No hay pedidos en el rango de fechas seleccionado</div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
            <div key={order._id} className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">Pedido #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString('es-AR')}</p>
                  {typeof order.user === 'object' && order.user.firstName && (
                    <p className="text-sm font-medium">{order.user.firstName}</p>
                  )}
                  <p className="text-sm text-gray-400">{typeof order.user === 'object' ? order.user.email : order.user}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.orderStatus] || 'bg-gray-700'}`}>
                    {statusLabels[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <p className="text-sm font-semibold mb-2">Productos:</p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-400">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Envío</span>
                  <span className="text-sm">{shippingLabels[order.shippingMethod] || order.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Costo de Envío</span>
                  <span className="text-primary">
                    {order.shippingCost && order.shippingCost > 0 ? `$${order.shippingCost.toLocaleString()}` : 'Gratis'}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-600 pt-3 mt-3">
                  <span>Total</span>
                  <span className="text-primary">${(order.totalAmount || 0).toLocaleString()}</span>
                </div>
                {order.shippingAddress && (
                  <>
                    {order.shippingAddress.address && (
                      <div className="text-xs space-y-1 text-gray-400">
                        <p>📍 {order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
                        <p>📱 {order.shippingAddress.phone}</p>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs font-bold text-white mb-2">📝 NOTAS DEL CLIENTE</p>
                      <div className="bg-gray-800 border-l-4 border-primary rounded p-3">
                        <p className="text-sm text-gray-300">{(order as any)?.shippingAddress?.notes || '(Sin notas)'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => handleOrderClick(order)} className="btn btn-primary w-full mt-4">
                Gestionar Pedido
              </button>
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

      {/* Modal de gestión */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Gestionar Pedido</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white text-2xl">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Detalle del Pedido</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.name} x{item.quantity}</span>
                        <span className="text-primary">${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Envío ({shippingLabels[selectedOrder.shippingMethod] || selectedOrder.shippingMethod})</span>
                      <span className="text-primary">{typeof selectedOrder.shippingCost === 'number' && selectedOrder.shippingCost > 0 ? `$${selectedOrder.shippingCost.toLocaleString()}` : 'Gratis'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                      <span>Total</span>
                      <span className="text-primary">${selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select className="input w-full" value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOrder.shippingMethod !== 'PICKUP' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Costo de Envío</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="0"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Notas de Admin</label>
                  <textarea
                    className="input w-full"
                    rows={4}
                    placeholder="Información adicional para el cliente..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setSelectedOrder(null)} className="btn bg-gray-700 hover:bg-gray-600 flex-1">
                    Cancelar
                  </button>
                  <button onClick={handleUpdateOrder} className="btn btn-primary flex-1">
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
