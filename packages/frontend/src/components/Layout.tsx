import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();

  // Agregar canonical dinámico en cada cambio de página
  useEffect(() => {
    const canonicalUrl = `https://www.sexysecret.com.ar${location.pathname}${location.search}`;
    
    // Buscar o crear etiqueta canonical existente
    let link = document.querySelector('link[rel="canonical"]');
    
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    
    link.setAttribute('href', canonicalUrl);
  }, [location.pathname, location.search]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-20 md:pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
