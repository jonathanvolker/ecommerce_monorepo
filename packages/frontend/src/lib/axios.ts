import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // NO intentar refresh en rutas de autenticación
    const authRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
    const isAuthRoute = authRoutes.some(route => originalRequest.url?.includes(route));
    
    // Si es un 401 y no es la ruta de auth, intentar refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      
      try {
        console.log('[AXIOS] Intentando refrescar token...');
        // Intentar refrescar el token
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data.data;
        useAuthStore.getState().setAccessToken(accessToken);
        
        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, entonces sí desloguear
        console.error('[AXIOS] Error al refrescar token:', refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    console.error('[AXIOS] Error en petición:', {
      url: originalRequest.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    
    return Promise.reject(error);
  }
);

export const apiClient = api;
export default api;
