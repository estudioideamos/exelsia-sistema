# Exelsia | Sistema de Operaciones

Plataforma interna de gestión para Exelsia (Foreign Trade Consulting): catálogos de comercio
exterior, operaciones, clientes, portal de cliente, avisos automáticos por email y exportación
de reportes.

Desarrollado por [Estudio Ideamos](https://ideamos.com.ar).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- [Supabase](https://supabase.com) — base de datos Postgres, autenticación, storage y RLS
- [Resend](https://resend.com) — envío de emails transaccionales
- Deploy automático en [Vercel](https://vercel.com) en cada push a `master`

## Desarrollo local

```bash
npm install
npm run dev
```

Necesitás un archivo `.env.local` con las credenciales de Supabase y Resend (no se commitea).

## Base de datos

El esquema y las migraciones viven en `supabase/`. `schema.sql` es la base inicial; los demás
archivos son migraciones incrementales aplicadas en orden sobre el proyecto de Supabase.

## Build

```bash
npm run build
```
