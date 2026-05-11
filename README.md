# Sistema de Inventario y Préstamo de Artículos (Frontend)

<p align="center">
  <img
    src="public/unicalretiana/image.png"
    alt="Uniclaretiana"
    width="180"
    style="background:#fff; padding:12px; border-radius:16px;"
  />
</p>

Aplicación web para la gestión de inventario, préstamos de artículos y reservas de salones.

## Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Arquitectura (alto nivel)

- La UI vive en `src/app`.
- La lógica de consumo de API está centralizada en `src/lib/api/client.ts`.
- El estado de la app y datos cargados se manejan con `src/state/app-state.tsx`.

## Módulos / páginas

Rutas principales en `src/app/app/*`:

- **Dashboard** (`/app/dashboard`)
  - Indicadores y gráficas (inventario + estado de préstamos).
- **Inventario** (`/app/inventario`)
  - Consulta/gestión del inventario.
- **Solicitar** (`/app/solicitar`)
  - Crear solicitudes de préstamo.
- **Solicitudes** (`/app/solicitudes`)
  - Revisión y acciones administrativas sobre solicitudes.
- **Préstamos** (`/app/prestamos`)
  - Seguimiento de préstamos activos/devueltos/vencidos.
- **Notificaciones** (`/app/notificaciones`)
  - Historial de notificaciones del sistema.
- **Usuarios** (`/app/usuarios`)
  - Gestión de usuarios (según permisos).
- **Reportes** (`/app/reportes`)
  - Visualización de reportes y evolución de préstamos.
- **Salones** (`/app/salones`)
  - Gestión de salones (admin) y solicitud/consulta de reservas (docente).
  - Flujo de reserva: docente solicita, admin aprueba/rechaza, se evita cruce de reservas.

## Estructura de carpetas

```text
src/
  app/
    app/                 # páginas autenticadas
    login/               # login
  components/            # componentes UI (charts, modales, tablas, etc.)
  lib/                   # cliente API, formatos, mocks, tipos
  state/                 # store/estado global
public/
  unicalretiana/         # imágenes del proyecto
```

## Configuración (variables de entorno)

Crea un archivo `.env.local` en `frontend/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Notas:

- El backend usa prefijo `/api`.
- El frontend consume rutas tipo `/api/rooms`, `/api/room-reservations`, etc.

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abrir:

- `http://localhost:3000`

## Scripts

```bash
npm run lint
npm run build
```

## Credenciales demo (si usas el seed del backend)

- Admin
  - Correo: `admin@miuniclaretiana.edu.co`
  - Contraseña: `DEMO_HASH`
- Docente
  - Correo: `docente@miuniclaretiana.edu.co`
  - Contraseña: `DEMO_HASH`

## Buenas prácticas

- No subas archivos `.env*` al repositorio.
- Si cambias el puerto del backend, actualiza `NEXT_PUBLIC_API_URL`.
