# SexySecret Mobile App

Aplicación móvil de SexySecret usando React Native con Expo y WebView.

## Requisitos

- Node.js >= 18
- pnpm >= 8
- Expo CLI
- Para Android: Android Studio
- Para iOS: Xcode (solo en Mac)

## Instalación

```bash
cd packages/mobile
pnpm install
```

## Desarrollo

### Iniciar el servidor de desarrollo
```bash
pnpm start
```

### Correr en Android
```bash
pnpm android
```

### Correr en iOS (solo Mac)
```bash
pnpm ios
```

## Configuración

Edita el archivo `App.tsx` y cambia la constante `WEB_APP_URL`:

- **Desarrollo local**: `http://TU_IP_LOCAL:3000` (ejemplo: `http://192.168.0.107:3000`)
- **Producción**: `https://tudominio.com`

## Build de producción

### Android APK
```bash
pnpm build:android
```

### iOS
```bash
pnpm build:ios
```

## Notas

- La app es un wrapper de WebView que carga la aplicación web
- Detecta automáticamente la conexión a internet
- Muestra estados de carga y error
- Compatible con gestos de navegación hacia atrás
