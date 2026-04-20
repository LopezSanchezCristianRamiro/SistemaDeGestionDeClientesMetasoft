
# SistemaDeGestionDeClientesMetasoft

Desarrollada con React Native + Expo Router.

## Cómo correr el proyecto

```bash
npm install
npm run start
```

## Arquitectura recomendada

La app sigue una estructura basada en Expo Router:

- `app/`: rutas y layouts de navegación.
- `screen/`: pantallas con lógica de negocio y UI principal.
- `components/`: componentes reutilizables globales.
- `hooks/`: hooks compartidos entre pantallas.
- `http/`: cliente HTTP y llamadas a APIs.
- `storage/`: persistencia local con AsyncStorage u otro almacenamiento.
- `constants/`: valores compartidos como fuentes, colores o configuraciones.

### Regla práctica

- `app/` debe contener solo navegación, redirects y layouts.
- `screen/` debe contener las pantallas reales.
- `components/` debe contener piezas reutilizables.
- `hooks/` debe contener lógica reutilizable sin UI.
- `http/` debe contener consumo de backend.

## Estructura de carpetas

```text
app/
  _layout.tsx
  index.tsx
  (auth)/
    _layout.tsx
    login.tsx
  (drawer)/
    _layout.tsx
    catalogo.tsx
    seguimiento.tsx
    reportes.tsx

screen/
  auth/
    components/
    hooks/
    types/
    login.tsx
  catalogo/
  seguimiento/
  reporte/

components/
hooks/
http/
storage/
constants/
```
### 1. Separar navegación de UI

En Expo Router, `app/` define rutas. Evita meter lógica pesada ahí. Lo ideal es que cada archivo de `app/` solo importe y renderice una pantalla.

Ejemplo:

- `app/(auth)/login.tsx` → renderiza `screen/auth/login.tsx`
- `app/(drawer)/catalogo.tsx` → renderiza `screen/catalogo/catalogo.tsx`

### 2. Usar grupos de rutas

Los grupos como `(auth)` y `(drawer)` ayudan a organizar flujos sin afectar la URL pública.

- `(auth)`: login, registro, recuperación de contraseña.
- `(drawer)`: pantallas internas de la app.

### 3. Mantener `Stack` o `Drawer` en layouts, no en pantallas

Los layouts deben definir el tipo de navegación:

- `app/_layout.tsx` → layout raíz.
- `app/(auth)/_layout.tsx` → stack para login y futuras pantallas públicas.
- `app/(drawer)/_layout.tsx` → drawer para el área privada.
Limpia el caché de Metro
npm start -- --clear
php artisan serve --host=0.0.0.0 --port=8001
npm run start -- --clear