import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import type { IStoreConfig } from '@sexshop/shared';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [storeConfig, setStoreConfig] = useState<IStoreConfig | null>(null);

  useEffect(() => {
    fetchStoreConfig();
  }, []);

  const fetchStoreConfig = async () => {
    try {
      const response = await apiClient.get('/store-config');
      const config = response.data?.data || response.data;
      setStoreConfig(config);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const whatsappUrl = storeConfig?.whatsappNumber 
    ? `https://wa.me/${storeConfig.whatsappNumber}` 
    : '#';

  return (
    <footer className="bg-dark-lighter border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Brand */}
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold mb-2">
            {storeConfig?.footerBrandName ? (
              <>
                <span className="text-primary">{storeConfig.footerBrandName.split(' ')[0] || 'Sexy'}</span>
                {storeConfig.footerBrandName.split(' ')[1] && (
                  <span className="text-white"> {storeConfig.footerBrandName.split(' ')[1]}</span>
                )}
              </>
            ) : (
              <>
                <span className="text-primary">Sexy</span>
                <span className="text-white">Secret</span>
              </>
            )}
          </h3>
          <p className="text-gray-400 text-sm">
            {storeConfig?.footerTagline || 'La privacidad es lo que nos diferencia.'}
          </p>
        </div>

        {/* Enlaces y Legal - Lado a lado en mobile y desktop */}
        <div className="grid grid-cols-2 gap-6 md:gap-12 md:max-w-md mb-6">
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 text-primary">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-primary transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              {storeConfig?.instagramUrl && (
                <li>
                  <a 
                    href={storeConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-primary">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-400">
          <p>{storeConfig?.copyrightText || `© ${currentYear} SexySecret. Todos los derechos reservados. +18`}</p>
        </div>
      </div>
    </footer>
  );
}
