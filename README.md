# Clínica — sitio web + panel de secretaría

Proyecto compuesto por dos aplicaciones:

- **backend/** — API en NestJS + Prisma, conectada a PostgreSQL en [Neon](https://neon.tech) (tier gratis).
- **frontend/** — Sitio web en Next.js (App Router).

## Requisitos

- Node.js 18+ (probado con Node 21).
- Acceso a la base de datos en Neon (connection string en `backend/.env`, no versionado por seguridad).

## Primera vez: instalación

```bash
cd backend
npm install
npx prisma migrate dev   # aplica las migraciones y crea los usuarios (seed automático)

cd ../frontend
npm install
```

> Si es una base de Neon nueva/vacía, `prisma migrate dev` crea todas las tablas. Si ya existe con las tablas creadas, alcanza con `npx prisma generate`.

## Levantar en local

En dos terminales distintas:

```bash
# Terminal 1
cd backend
npm run start:dev   # http://localhost:3001

# Terminal 2
cd frontend
npm run dev          # http://localhost:3000
```

## Credenciales de acceso al panel (entorno local)

Definidas en `backend/.env` (podés cambiarlas antes del primer `prisma migrate dev`):

- Secretaria — Usuario: `secretaria` / Contraseña: `clinica123`
- Dirección (jefa) — Usuario: `marina` / Contraseña: `benitez123`

Los médicos no se seedean: cada uno se crea con su propio usuario y contraseña desde el panel de secretaria/dirección (sección "Médicos").

Acceso al panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Número de WhatsApp de la secretaría

Configurar en `frontend/.env.local`:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=549XXXXXXXXXX
```

Formato: código de país + número, sin espacios ni símbolos (ej. `5491122334455`).

## Funcionalidad

- **Sitio público** (`/`, `/medicos`, `/medicos/[id]`): listado de médicos activos, ficha de cada médico con horarios disponibles y botón para coordinar el turno por WhatsApp.
- **Panel** (`/admin`), con acceso y permisos según el rol:
  - **Secretaria**: alta/edición/baja de médicos (con foto y usuario/contraseña propios), carga de horarios y asignación de turnos a pacientes de cualquier médico.
  - **Médico**: ve y gestiona únicamente sus propios turnos (cargar horarios, asignar o liberar pacientes).
  - **Dirección (jefa)**: todo lo anterior, más registro de ingresos/egresos (`/admin/finanzas`) y un panel de estadísticas (`/admin/estadisticas`) con turnos por médico y balance financiero.

## Notas técnicas

- Base de datos: PostgreSQL en Neon (tier gratis, permanente). `DATABASE_URL` en `backend/.env` usa la conexión "pooled" (para la app) y `DIRECT_DATABASE_URL` la conexión directa (usada solo por `prisma migrate`). Ambas se consiguen en el dashboard de Neon → Connection Details.
- Los datos quedan guardados en la nube: apagar el backend/frontend no borra nada. Neon solo "duerme" el cómputo tras un rato sin uso; el primer request después de eso tarda un par de segundos extra en despertar.
- Las fotos de los médicos se guardan en `backend/uploads/doctors` (disco local del backend) y se sirven desde `http://localhost:3001/uploads/doctors/...`. A diferencia de la base de datos, esto **no** vive en la nube — si el backend corre en otra máquina o se redeploya sin ese disco, las fotos se pierden.
- Autenticación vía JWT (`backend/.env` → `JWT_SECRET`).
