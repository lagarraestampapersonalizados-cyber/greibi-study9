-- Cotizador 3D - esquema inicial
create extension if not exists pgcrypto;

create table if not exists public.cotizaciones_3d (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  cliente text not null default 'Mostrador',
  pieza text not null,
  material text not null,
  peso_g numeric(12,2) not null default 0,
  horas_impresion numeric(12,2) not null default 0,
  costo_material numeric(12,2) not null default 0,
  costo_electricidad numeric(12,2) not null default 0,
  costo_maquina numeric(12,2) not null default 0,
  costo_mano_obra numeric(12,2) not null default 0,
  otros_costos numeric(12,2) not null default 0,
  costo_real numeric(12,2) not null default 0,
  precio_venta numeric(12,2) not null default 0,
  utilidad numeric(12,2) not null default 0,
  estado text not null default 'Pendiente',
  created_at timestamptz not null default now()
);
create table if not exists public.materiales_3d (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  costo_kg numeric(12,2) not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.impresoras_3d (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  costo_hora numeric(12,2) not null default 0,
  potencia_w numeric(12,2) not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.configuracion_3d (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  valor numeric(12,4) not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.cotizaciones_3d enable row level security;
alter table public.materiales_3d enable row level security;
alter table public.impresoras_3d enable row level security;
alter table public.configuracion_3d enable row level security;
create policy "cotizaciones_3d_auth" on public.cotizaciones_3d for all to authenticated using (true) with check (true);
create policy "materiales_3d_auth" on public.materiales_3d for all to authenticated using (true) with check (true);
create policy "impresoras_3d_auth" on public.impresoras_3d for all to authenticated using (true) with check (true);
create policy "configuracion_3d_auth" on public.configuracion_3d for all to authenticated using (true) with check (true);
