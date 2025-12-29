import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { apiClient } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { IStoreConfig } from '@sexshop/shared';

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout);
  const items = useCartStore((state) => state.items);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeConfig, setStoreConfig] = useState<IStoreConfig | null>(null);

  useEffect(() => {
    fetchStoreConfig();
  }, []);

  const fetchStoreConfig = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: IStoreConfig }>('/store-config');
      setStoreConfig(response.data.data);
    } catch (error) {
      console.error('Error al cargar configuración');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      logoutAction();
      toast.success('Sesión cerrada');
      navigate('/');
      setMenuOpen(false);
    } catch (error) {
      logoutAction();
      navigate('/');
    }
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-dark-lighter border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="text-lg md:text-2xl font-bold" onClick={() => setMenuOpen(false)}>
            {storeConfig?.footerBrandName ? (
              <span className="text-white">
                <span className="text-primary">{storeConfig.footerBrandName.split(' ')[0] || 'Sexy'}</span>
                {storeConfig.footerBrandName.split(' ')[1] && (
                  <span className="text-white">{storeConfig.footerBrandName.split(' ')[1]}</span>
                )}
              </span>
            ) : (
              <>
                <span className="text-primary">Sexy</span>
                <span className="text-white">Secret</span>
              </>
            )}
          </Link>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link to="/products" className="hover:text-primary transition-colors">
              Productos
            </Link>
          </div>

          {/* Actions - Desktop & Mobile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative hover:text-primary transition-colors text-xl md:text-2xl"
              onClick={() => setMenuOpen(false)}
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-primary text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="bg-gray-800 hover:bg-gray-700 transition-colors px-3 py-1 rounded text-sm font-semibold"
                    title={user.email}
                  >
                    👤 {user.firstName}
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="bg-primary hover:bg-primary/80 transition-colors px-3 py-1 rounded text-sm font-semibold"
                    >
                      ⚙️ Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-900 hover:bg-red-800 transition-colors px-3 py-1 rounded text-sm font-semibold"
                  >
                    🚪 Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-gray-800 hover:bg-gray-700 transition-colors px-3 py-1 rounded text-sm font-semibold">
                    Ingresar
                  </Link>
                  <Link to="/register" className="bg-primary hover:bg-primary/80 transition-colors px-3 py-1 rounded text-sm font-semibold">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1 hover:text-primary transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-3 space-y-2">
            <Link
              to="/"
              className="block py-2 hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/products"
              className="block py-2 hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Productos
            </Link>
            
            <div className="border-t border-gray-800 pt-2 mt-2 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block bg-gray-800 hover:bg-gray-700 transition-colors px-3 py-2 rounded font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    👤 {user.firstName}
                    <span className="block text-xs text-gray-400 font-normal">{user.email}</span>
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="block bg-primary hover:bg-primary/80 transition-colors px-3 py-2 rounded font-semibold"
                      onClick={() => setMenuOpen(false)}
                    >
                      ⚙️ Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left bg-red-900 hover:bg-red-800 transition-colors px-3 py-2 rounded font-semibold"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block bg-gray-800 hover:bg-gray-700 transition-colors px-3 py-2 rounded font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    🔐 Ingresar
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-primary hover:bg-primary/80 transition-colors px-3 py-2 rounded font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    ✨ Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
