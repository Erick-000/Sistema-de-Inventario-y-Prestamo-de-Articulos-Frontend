# Sistema de Inventario y Prestamo de Articulos (Frontend)

Aplicacion web para gestion de inventario, prestamos de articulos y reserva de salones. Desarrollado para la Fundacion Universitaria Claretiana (Uniclaretiana).

## Stack

- Next.js 16.2 (App Router)
- React 19.2
- TypeScript 5
- Tailwind CSS 4
- Recharts 3.8

## Requisitos

- Node.js 18+ (LTS)
- Backend ejecutandose en http://localhost:3001

## Instalacion

```bash
git clone https://github.com/Erick-000/Sistema-de-Inventario-y-Prestamo-de-Articulos-Frontend.git
cd Sistema-de-Inventario-y-Prestamo-de-Articulos-Frontend
npm install
```

## Variables de Entorno

Crear `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Ejecucion

```bash
npm run dev      # desarrollo (localhost:3000)
npm run build    # build de produccion
npm run start    # servir produccion
npm run lint     # ESLint
```

## Modulos

### Dashboard (/app/dashboard)
KPIs y graficas: PieChart de inventario por categoria y BarChart de estado de prestamos.

### Inventario (/app/inventario)
CRUD de articulos con busqueda y filtros dropdown por categoria y estado.

### Solicitar (/app/solicitar)
Formulario para crear solicitudes de prestamo con seleccion de articulos.

### Solicitudes (/app/solicitudes)
Bandeja de solicitudes. Admin aprueba, rechaza o ve detalles.

### Prestamos (/app/prestamos)
Seguimiento de prestamos activos, devueltos y vencidos. Registro de devoluciones.

### Salones (/app/salones)
- Admin: CRUD de salones, calendario semanal con colores por estado, bloqueo de salones, aprobacion/rechazo de reservas.
- Docente: galeria de salones, solicitud de reserva con fecha y rango horario, cancelacion de reservas propias.
- Prevencion de cruces: el backend rechaza reservas solapadas para el mismo salon con mensaje descriptivo.

### Notificaciones (/app/notificaciones)
Historial de notificaciones con detalle por modal.

### Usuarios (/app/usuarios)
Tabla de usuarios con filtros. Gestion de roles (admin).

### Reportes (/app/reportes)
Grafica de evolucion de prestamos (AreaChart + LineChart): total, articulos y salones. Ventana de 14 dias.

## Roles

| Rol | Permisos |
| :--- | :--- |
| Admin | Dashboard, inventario (CRUD), solicitudes (aprobar/rechazar), prestamos, usuarios, reportes, salones (gestion), notificaciones |
| Docente | Dashboard, inventario (consulta), solicitar, mis solicitudes, salones (reserva), notificaciones |

## Credenciales Demo

| Rol | Correo | Contrasena |
| :--- | :--- | :--- |
| Admin | admin@miuniclaretiana.edu.co | DEMO_HASH |
| Docente | docente@miuniclaretiana.edu.co | DEMO_HASH |

## Colores de Estado

| Estado | Color |
| :--- | :--- |
| Aprobado / Reservado / Activo | Verde esmeralda |
| Pendiente / Solicitado | Ambar |
| Rechazado / Vencido | Rojo |
| Cancelado / Devuelto | Gris pizarra |

## Convenciones

- Conventional Commits (feat:, fix:, docs:, chore:)
- Componentes funcionales con hooks, PascalCase
- Tailwind CSS utilitario, sin CSS inline
- TypeScript estricto
- API calls solo via apiFetch (lib/api/client.ts)
- Estado global en state/app-state.tsx (React Context)

---

Desarrollado para la Fundacion Universitaria Claretiana - 2026
