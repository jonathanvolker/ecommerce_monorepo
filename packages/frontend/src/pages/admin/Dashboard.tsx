import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import ProductsAdmin from './ProductsAdmin';
import OrdersAdmin from './OrdersAdmin';
import CategoriesAdmin from './CategoriesAdmin';
import StoreConfigAdmin from './StoreConfigAdmin';
import UsersAdmin from './UsersAdmin';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    }
  }, [user]);

  if (!user || !user.isAdmin) return null;

  const tabs = [
    { id: 'products', label: 'Productos', path: '/admin' },
    { id: 'orders', label: 'Pedidos', path: '/admin/orders' },
    { id: 'users', label: 'Usuarios', path: '/admin/users' },
    { id: 'categories', label: 'Categorías', path: '/admin/categories' },
    { id: 'config', label: 'Configuración', path: '/admin/config' },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Panel <span className="text-primary">Administrador</span>
      </h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto mb-8 border-b border-gray-700 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 md:px-4 py-3 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <Routes>
        <Route index element={<ProductsAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="config" element={<StoreConfigAdmin />} />
      </Routes>
    </div>
  );
}
