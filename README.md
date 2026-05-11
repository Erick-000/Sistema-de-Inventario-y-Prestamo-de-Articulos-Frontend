# Sistema de Inventario y Préstamo de Artículos (Frontend)

Frontend web del sistema de inventario, préstamos de artículos y reservas de salones.

## Tecnologías

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Requisitos

- Node.js (recomendado: LTS)
- Backend ejecutándose (NestJS)

## Variables de entorno

Crea un archivo `.env.local` en `frontend/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> Nota: el backend usa prefijo `/api`, y el frontend ya consume endpoints como `/api/...`.

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

## Scripts útiles

```bash
npm run lint
npm run build
```

## Credenciales demo (si usas el seed)

- Admin
  - Correo: `admin@miuniclaretiana.edu.co`
  - Contraseña: `DEMO_HASH`
- Docente
  - Correo: `docente@miuniclaretiana.edu.co`
  - Contraseña: `DEMO_HASH`

## Notas

- No subas archivos `.env*` al repositorio.
- Si cambias el puerto del backend, actualiza `NEXT_PUBLIC_API_URL`.
