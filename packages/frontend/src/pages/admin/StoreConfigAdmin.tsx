import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { IStoreConfig } from '@sexshop/shared';

export default function StoreConfigAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<IStoreConfig | null>(null);

  const [formData, setFormData] = useState({
    cbu: '',
    alias: '',
    accountHolder: '',
    bankName: '',
    whatsappNumber: '',
    instagramUrl: '',
    storeName: '',
    pickupInstructions: '',
    shippingInstructions: '',
    homeMainText: '',
    homeSecondaryText: '',
    privacyPolicy: '',
    termsOfService: '',
    footerBrandName: '',
    footerTagline: '',
    copyrightText: '',
    shippingCosts: {
      VIA_CARGO: 0,
      CORREO_ARGENTINO: 0,
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: IStoreConfig }>('/store-config');
      const configData = response.data.data;
      setConfig(configData);
      setFormData({
        cbu: configData.bankDetails.cbu,
        alias: configData.bankDetails.alias,
        accountHolder: configData.bankDetails.accountHolder,
        bankName: configData.bankDetails.bankName,
        whatsappNumber: configData.whatsappNumber,
        instagramUrl: configData.instagramUrl || '',
        storeName: configData.storeName || '',
        pickupInstructions: configData.pickupInstructions || '',
        shippingInstructions: configData.shippingInstructions || '',
        homeMainText: configData.homeMainText || '',
        homeSecondaryText: configData.homeSecondaryText || '',
        privacyPolicy: configData.privacyPolicy || '',
        termsOfService: configData.termsOfService || '',
        footerBrandName: configData.footerBrandName || '',
        footerTagline: configData.footerTagline || '',
        copyrightText: configData.copyrightText || '',
        shippingCosts: configData.shippingCosts || {
          VIA_CARGO: 0,
          CORREO_ARGENTINO: 0,
        },
      });
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updateData = {
        bankDetails: {
          cbu: formData.cbu,
          alias: formData.alias,
          accountHolder: formData.accountHolder,
          bankName: formData.bankName,
        },
        whatsappNumber: formData.whatsappNumber,
        instagramUrl: formData.instagramUrl,
        storeName: formData.storeName,
        pickupInstructions: formData.pickupInstructions,
        shippingInstructions: formData.shippingInstructions,
        homeMainText: formData.homeMainText,
        homeSecondaryText: formData.homeSecondaryText,
        privacyPolicy: formData.privacyPolicy,
        termsOfService: formData.termsOfService,
        footerBrandName: formData.footerBrandName,
        footerTagline: formData.footerTagline,
        copyrightText: formData.copyrightText,
        shippingCosts: formData.shippingCosts,
      };

      await apiClient.put('/store-config', updateData);
      toast.success('Configuración actualizada');
      fetchConfig();
    } catch (error: unknown) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
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
      <h2 className="text-2xl font-bold mb-6">Configuración de la Tienda</h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Datos bancarios */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Datos Bancarios</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CBU *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.cbu}
                onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                placeholder="0000000000000000000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Alias *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="MI.ALIAS.BANCO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Titular de la Cuenta *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Banco *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Banco Galicia"
              />
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Información General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de la Tienda *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="SexySecret"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Número de WhatsApp *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="5491112345678"
              />
              <p className="text-sm text-gray-400 mt-1">Para Argentina: 549 + código de área + número (ejemplo: 5491112345678)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="text"
                className="input w-full"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/tuusuario"
              />
              <p className="text-sm text-gray-400 mt-1">URL completa de tu perfil de Instagram</p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Instrucciones</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instrucciones de Retiro</label>
              <textarea
                className="input w-full"
                rows={3}
                value={formData.pickupInstructions}
                onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                placeholder="Horario de atención, dirección del local, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instrucciones de Envío</label>
              <textarea
                className="input w-full"
                rows={3}
                value={formData.shippingInstructions}
                onChange={(e) => setFormData({ ...formData, shippingInstructions: e.target.value })}
                placeholder="Información sobre costos de envío, tiempos de entrega, etc."
              />
            </div>
          </div>
        </div>

        {/* Costos de Envío */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Costos de Envío</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Costo Vía Cargo ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input w-full"
                value={formData.shippingCosts.VIA_CARGO}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingCosts: { ...formData.shippingCosts, VIA_CARGO: parseFloat(e.target.value) || 0 }
                })}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-400 mt-1">Costo de envío por Vía Cargo. 0 = gratuito</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Costo Correo Argentino ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input w-full"
                value={formData.shippingCosts.CORREO_ARGENTINO}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingCosts: { ...formData.shippingCosts, CORREO_ARGENTINO: parseFloat(e.target.value) || 0 }
                })}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-400 mt-1">Costo de envío por Correo Argentino. 0 = gratuito</p>
            </div>
          </div>
        </div>

        {/* Personalización */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Personalización de Textos</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Texto Principal (Home)</label>
              <input
                type="text"
                className="input w-full"
                value={formData.homeMainText}
                onChange={(e) => setFormData({ ...formData, homeMainText: e.target.value })}
                placeholder="Tu tienda de confianza para productos de calidad +18"
              />
              <p className="text-sm text-gray-400 mt-1">Aparece debajo del logo en la página de inicio</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre de Marca</label>
              <input
                type="text"
                className="input w-full"
                value={formData.footerBrandName}
                onChange={(e) => setFormData({ ...formData, footerBrandName: e.target.value })}
                placeholder="Sexy Secret"
              />
              <p className="text-sm text-gray-400 mt-1">Dos palabras separadas por espacio. Primera palabra en fucsia, segunda en blanco. Aparece en navbar y footer.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Eslogan del Footer</label>
              <input
                type="text"
                className="input w-full"
                value={formData.footerTagline}
                onChange={(e) => setFormData({ ...formData, footerTagline: e.target.value })}
                placeholder="La privacidad es lo que nos diferencia."
              />
              <p className="text-sm text-gray-400 mt-1">Frase destacada que aparece debajo del nombre de marca en el footer</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Texto de Copyright</label>
              <input
                type="text"
                className="input w-full"
                value={formData.copyrightText}
                onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                placeholder="© 2025 SexySecret. Todos los derechos reservados. +18"
              />
              <p className="text-sm text-gray-400 mt-1">Texto completo que aparece en la parte inferior del footer</p>
            </div>
          </div>
        </div>

        {/* Políticas */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Políticas y Términos</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Política de Privacidad</label>
              <textarea
                className="input w-full"
                rows={8}
                value={formData.privacyPolicy}
                onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.value })}
                placeholder="Escribe aquí la política de privacidad de tu tienda..."
              />
              <p className="text-sm text-gray-400 mt-1">Se mostrará en /privacy</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Términos y Condiciones</label>
              <textarea
                className="input w-full"
                rows={8}
                value={formData.termsOfService}
                onChange={(e) => setFormData({ ...formData, termsOfService: e.target.value })}
                placeholder="Escribe aquí los términos y condiciones de tu tienda..."
              />
              <p className="text-sm text-gray-400 mt-1">Se mostrará en /terms</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  );
}
