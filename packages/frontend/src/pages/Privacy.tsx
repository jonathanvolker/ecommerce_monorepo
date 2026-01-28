import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import { cacheService } from '@/lib/cache';
import type { IStoreConfig } from '@sexshop/shared';

export default function Privacy() {
  const [config, setConfig] = useState<IStoreConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async (forceRefresh = false) => {
    const useCache = !forceRefresh;
    const cachedConfig = useCache ? cacheService.get<IStoreConfig>('store-config') : null;

    if (cachedConfig) {
      setConfig(cachedConfig);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get<{ success: boolean; data: IStoreConfig }>('/store-config');
      const config = (response.data?.data || response.data) as IStoreConfig;
      setConfig(config);
      cacheService.set('store-config', config, 10 * 60 * 1000);
    } catch (error) {
      console.error('Error al cargar configuración');
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Política de <span className="text-primary">Privacidad</span>
        </h1>
        
        <div className="bg-gray-900 rounded-lg p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {config?.privacyPolicy || 'No hay información de privacidad disponible.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
