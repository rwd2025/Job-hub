-- Rolling Cecil AI Master Backend Schema + Universal Search
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists parts (
  id uuid primary key default gen_random_uuid(),
  part_number text not null,
  manufacturer_id uuid references manufacturers(id),
  description text,
  category text,
  created_at timestamptz default now(),
  unique(part_number, manufacturer_id)
);

create table if not exists part_cross_refs (
  id uuid primary key default gen_random_uuid(),
  part_id uuid references parts(id) on delete cascade,
  cross_ref_id uuid references parts(id) on delete cascade,
  confidence_score float default 1.0,
  source_name text,
  notes text,
  created_at timestamptz default now(),
  unique(part_id, cross_ref_id)
);

create table if not exists repair_kits (
  id bigint generated always as identity primary key,
  component_name text,
  engine_family text,
  oem_part_number text,
  gasket_set text,
  seals text,
  o_rings text,
  bearings text,
  hardware text,
  labor_hours numeric,
  torque_specs text,
  repair_notes text,
  created_at timestamptz default now()
);

create table if not exists labor_times (
  id bigint generated always as identity primary key,
  component_name text,
  engine_family text,
  labor_hours numeric,
  labor_operation text,
  difficulty text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists torque_specs (
  id bigint generated always as identity primary key,
  engine_family text,
  component_name text,
  fastener text,
  torque_value text,
  sequence_notes text,
  created_at timestamptz default now()
);

create table if not exists common_failures (
  id bigint generated always as identity primary key,
  fault_code text,
  symptom text,
  engine_family text,
  likely_causes text,
  common_fix text,
  tech_notes text,
  created_at timestamptz default now()
);

create table if not exists fluids_filters (
  id bigint generated always as identity primary key,
  engine_family text,
  service_type text,
  oil_filter text,
  fuel_filter text,
  water_separator text,
  air_filter text,
  coolant_filter text,
  oil_capacity text,
  coolant_capacity text,
  recommended_oil text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists diagnostic_tests (
  id bigint generated always as identity primary key,
  engine_family text,
  fault_code text,
  symptom text,
  test_name text,
  test_steps text,
  pass_fail_specs text,
  next_step_if_failed text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists supplier_links (
  id bigint generated always as identity primary key,
  part_number text,
  supplier_name text,
  search_url text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_parts_number on parts(part_number);
create index if not exists idx_parts_description on parts using gin(to_tsvector('english', coalesce(description,'') || ' ' || coalesce(category,'')));
create index if not exists idx_repair_kits_search on repair_kits(component_name, engine_family, oem_part_number);
create index if not exists idx_cross_part_id on part_cross_refs(part_id);
create index if not exists idx_cross_ref_id on part_cross_refs(cross_ref_id);

create or replace function universal_diesel_search(search_text text)
returns jsonb
language plpgsql
stable
as $$
declare
  q text := trim(coalesce(search_text,''));
  result jsonb;
begin
  result := jsonb_build_object(
    'parts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'part_number', p.part_number,
        'manufacturer', m.name,
        'description', p.description,
        'category', p.category
      )), '[]'::jsonb)
      from parts p
      left join manufacturers m on m.id = p.manufacturer_id
      where q <> '' and (
        p.part_number ilike '%' || q || '%'
        or p.description ilike '%' || q || '%'
        or p.category ilike '%' || q || '%'
        or m.name ilike '%' || q || '%'
      )
      limit 25
    ),
    'cross_refs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'source_part', p1.part_number,
        'source_brand', m1.name,
        'cross_part', p2.part_number,
        'cross_brand', m2.name,
        'confidence_score', cr.confidence_score,
        'source_name', cr.source_name,
        'notes', cr.notes
      )), '[]'::jsonb)
      from part_cross_refs cr
      join parts p1 on p1.id = cr.part_id
      left join manufacturers m1 on m1.id = p1.manufacturer_id
      join parts p2 on p2.id = cr.cross_ref_id
      left join manufacturers m2 on m2.id = p2.manufacturer_id
      where q <> '' and (
        p1.part_number ilike '%' || q || '%'
        or p2.part_number ilike '%' || q || '%'
        or p1.description ilike '%' || q || '%'
        or p2.description ilike '%' || q || '%'
        or m1.name ilike '%' || q || '%'
        or m2.name ilike '%' || q || '%'
      )
      limit 25
    ),
    'repair_kits', (
      select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
      from repair_kits r
      where q <> '' and (
        r.component_name ilike '%' || q || '%'
        or r.engine_family ilike '%' || q || '%'
        or r.oem_part_number ilike '%' || q || '%'
      )
      limit 10
    ),
    'labor_times', (
      select coalesce(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
      from labor_times l
      where q <> '' and (
        l.component_name ilike '%' || q || '%'
        or l.engine_family ilike '%' || q || '%'
        or l.labor_operation ilike '%' || q || '%'
      )
      limit 10
    ),
    'torque_specs', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from torque_specs t
      where q <> '' and (
        t.component_name ilike '%' || q || '%'
        or t.engine_family ilike '%' || q || '%'
        or t.fastener ilike '%' || q || '%'
      )
      limit 10
    ),
    'common_failures', (
      select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb)
      from common_failures c
      where q <> '' and (
        c.fault_code ilike '%' || q || '%'
        or c.symptom ilike '%' || q || '%'
        or c.engine_family ilike '%' || q || '%'
        or c.common_fix ilike '%' || q || '%'
      )
      limit 10
    ),
    'fluids_filters', (
      select coalesce(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
      from fluids_filters f
      where q <> '' and (
        f.engine_family ilike '%' || q || '%'
        or f.service_type ilike '%' || q || '%'
        or f.oil_filter ilike '%' || q || '%'
        or f.fuel_filter ilike '%' || q || '%'
      )
      limit 10
    ),
    'diagnostic_tests', (
      select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
      from diagnostic_tests d
      where q <> '' and (
        d.engine_family ilike '%' || q || '%'
        or d.fault_code ilike '%' || q || '%'
        or d.symptom ilike '%' || q || '%'
        or d.test_name ilike '%' || q || '%'
      )
      limit 10
    ),
    'supplier_links', (
      select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
      from supplier_links s
      where q <> '' and (
        s.part_number ilike '%' || q || '%'
        or s.supplier_name ilike '%' || q || '%'
      )
      limit 10
    )
  );
  return result;
end;
$$;

-- Sample seed data. Safe to run multiple times because of ON CONFLICT on manufacturers/parts/cross refs.
insert into manufacturers (name) values
('Cummins'),('Detroit Diesel'),('Navistar'),('PACCAR'),('Fleetguard'),('Bendix'),('Baldwin'),('Donaldson'),('Nelson'),('REP')
on conflict (name) do nothing;

with m as (select id from manufacturers where name='Cummins')
insert into parts(part_number, manufacturer_id, description, category)
select '4353204', id, 'OEM primary air filter', 'Filtration' from m
on conflict do nothing;
with m as (select id from manufacturers where name='Fleetguard')
insert into parts(part_number, manufacturer_id, description, category)
select 'AF27844', id, 'Interchange air filter', 'Filtration' from m
on conflict do nothing;
with m as (select id from manufacturers where name='Navistar')
insert into parts(part_number, manufacturer_id, description, category)
select '2501022C92', id, 'OEM AD-IP air dryer', 'Braking' from m
on conflict do nothing;
with m as (select id from manufacturers where name='Bendix')
insert into parts(part_number, manufacturer_id, description, category)
select '800405', id, 'AD-IP air dryer interchange', 'Braking' from m
on conflict do nothing;

insert into part_cross_refs(part_id, cross_ref_id, confidence_score, source_name)
select p1.id, p2.id, 1.0, 'Manual_Seed'
from parts p1, parts p2
where (p1.part_number='4353204' and p2.part_number='AF27844')
   or (p1.part_number='2501022C92' and p2.part_number='800405')
on conflict do nothing;
