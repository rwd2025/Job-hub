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


-- PHASE 1 SHOP OS TABLES
create table if not exists saved_jobs (
  id bigint generated always as identity primary key,
  vin text,
  year text,
  make text,
  model text,
  engine text,
  customer_name text,
  customer_phone text,
  complaint text,
  cause text,
  correction text,
  labor_hours numeric default 0,
  labor_total numeric default 0,
  parts_total numeric default 0,
  grand_total numeric default 0,
  invoice_text text,
  created_at timestamptz default now()
);

create table if not exists saved_parts (
  id bigint generated always as identity primary key,
  vin text,
  oem_part text,
  aftermarket_part text,
  component_name text,
  manufacturer text,
  qty numeric default 1,
  price numeric default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists labor_clock (
  id bigint generated always as identity primary key,
  vin text,
  technician text,
  start_time timestamptz,
  stop_time timestamptz,
  labor_hours numeric default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists truck_history (
  id bigint generated always as identity primary key,
  vin text,
  event_type text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists repair_notes (
  id bigint generated always as identity primary key,
  vin text,
  symptom text,
  repair_action text,
  verified_fix boolean default false,
  created_at timestamptz default now()
);

create index if not exists saved_jobs_vin_idx on saved_jobs(vin);
create index if not exists saved_parts_vin_idx on saved_parts(vin);
create index if not exists labor_clock_vin_idx on labor_clock(vin);
create index if not exists truck_history_vin_idx on truck_history(vin);
create index if not exists repair_notes_vin_idx on repair_notes(vin);


-- PHASE 2 PARTS INTELLIGENCE SUPPORT
-- Safe relational parts/cross-reference backbone for OEM -> aftermarket chains.
create table if not exists manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
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
  part_id uuid references parts(id),
  cross_ref_id uuid references parts(id),
  confidence_score numeric default 1.0,
  ref_type text default 'Interchange',
  source_name text default 'Manual',
  notes text,
  created_at timestamptz default now(),
  unique(part_id, cross_ref_id)
);

create index if not exists idx_parts_part_number on parts(part_number);
create index if not exists idx_part_cross_refs_part_id on part_cross_refs(part_id);
create index if not exists idx_part_cross_refs_cross_ref_id on part_cross_refs(cross_ref_id);

create or replace function recursive_interchange_search(search_text text)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  with recursive start_parts as (
    select p.id, p.part_number, p.description, m.name as manufacturer
    from parts p
    left join manufacturers m on m.id = p.manufacturer_id
    where p.part_number ilike '%' || search_text || '%'
    limit 10
  ), chain as (
    select sp.id as root_id, sp.id as part_id, sp.part_number, sp.description, sp.manufacturer, 0 as depth, 1.0::numeric as confidence_score
    from start_parts sp
    union
    select c.root_id, p2.id, p2.part_number, p2.description, m2.name as manufacturer, c.depth + 1, pcr.confidence_score
    from chain c
    join part_cross_refs pcr on pcr.part_id = c.part_id
    join parts p2 on p2.id = pcr.cross_ref_id
    left join manufacturers m2 on m2.id = p2.manufacturer_id
    where c.depth < 3
  )
  select coalesce(jsonb_agg(to_jsonb(chain)), '[]'::jsonb) into result
  from chain;
  return result;
end;
$$;


-- PHASE 3 DIESEL INTELLIGENCE ENGINE
create table if not exists known_engine_patterns (
  id bigint generated always as identity primary key,
  engine_family text,
  platform text,
  fault_code text,
  symptom text,
  pattern text,
  common_fix text,
  warning text,
  confidence_score numeric default 0.80,
  created_at timestamptz default now()
);

create table if not exists diagnostic_memory (
  id bigint generated always as identity primary key,
  vin text,
  engine_family text,
  fault_code text,
  symptom text,
  confirmed_cause text,
  confirmed_fix text,
  parts_used text,
  test_results text,
  confidence_score numeric default 1.0,
  created_at timestamptz default now()
);

alter table common_failures add column if not exists confidence_score numeric default 0.80;
alter table common_failures add column if not exists warning text;
alter table diagnostic_tests add column if not exists confidence_score numeric default 0.80;
alter table repair_notes add column if not exists engine_family text;
alter table repair_notes add column if not exists fault_code text;

create index if not exists idx_known_engine_patterns_engine on known_engine_patterns(engine_family);
create index if not exists idx_known_engine_patterns_fault on known_engine_patterns(fault_code);
create index if not exists idx_diagnostic_memory_vin on diagnostic_memory(vin);
create index if not exists idx_diagnostic_memory_fault on diagnostic_memory(fault_code);

create or replace function diesel_brain_search(search_text text, vin_text text default null)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  result := jsonb_build_object(
    'common_failures', (
      select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb)
      from common_failures c
      where c.fault_code ilike '%' || search_text || '%'
         or c.symptom ilike '%' || search_text || '%'
         or c.engine_family ilike '%' || search_text || '%'
         or c.likely_causes ilike '%' || search_text || '%'
         or c.common_fix ilike '%' || search_text || '%'
      limit 12
    ),
    'diagnostic_tests', (
      select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
      from diagnostic_tests d
      where d.fault_code ilike '%' || search_text || '%'
         or d.symptom ilike '%' || search_text || '%'
         or d.engine_family ilike '%' || search_text || '%'
         or d.test_name ilike '%' || search_text || '%'
      limit 12
    ),
    'known_patterns', (
      select coalesce(jsonb_agg(to_jsonb(k)), '[]'::jsonb)
      from known_engine_patterns k
      where k.fault_code ilike '%' || search_text || '%'
         or k.symptom ilike '%' || search_text || '%'
         or k.engine_family ilike '%' || search_text || '%'
         or k.pattern ilike '%' || search_text || '%'
         or k.common_fix ilike '%' || search_text || '%'
      limit 12
    ),
    'repair_memory', (
      select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
      from repair_notes r
      where (vin_text is not null and r.vin = vin_text)
         or r.symptom ilike '%' || search_text || '%'
         or r.repair_action ilike '%' || search_text || '%'
      limit 12
    ),
    'diagnostic_memory', (
      select coalesce(jsonb_agg(to_jsonb(m)), '[]'::jsonb)
      from diagnostic_memory m
      where (vin_text is not null and m.vin = vin_text)
         or m.fault_code ilike '%' || search_text || '%'
         or m.symptom ilike '%' || search_text || '%'
         or m.confirmed_cause ilike '%' || search_text || '%'
         or m.confirmed_fix ilike '%' || search_text || '%'
      limit 12
    )
  );
  return result;
end;
$$;

-- Starter seed examples. Verify all service data by VIN/ESN/CPL before customer use.
insert into known_engine_patterns (engine_family, platform, fault_code, symptom, pattern, common_fix, warning, confidence_score)
values
('Cummins X15', 'Heavy Duty', 'SPN 5246 FMI 15', 'SCR derate / inducement', 'Often follows upstream NOx/DEF/SCR faults, failed regens, poor DEF quality, or ignored active codes.', 'Resolve root emissions fault, perform proper regen/SCR test, verify NOx conversion before clearing derate.', 'Do not only clear codes. Find the original emissions fault first.', 0.82),
('Detroit DD15', 'Heavy Duty', 'EGR DELTA PRESSURE', 'EGR flow fault / delta pressure reading off', 'Delta pressure tubes/sensor plugging, leaks, wiring faults, or EGR restriction can skew readings.', 'Inspect tubes/hoses, verify sensor power/ground/signal, run EGR low flow/slow learn procedure when applicable.', 'Do not condemn EGR valve until sensor/tubes and wiring are verified.', 0.84),
('PACCAR MX13', 'Heavy Duty', 'NOX EFFICIENCY', 'Outlet NOx efficiency high / SCR efficiency issue', 'Commonly caused by DEF quality, dosing issue, exhaust leak, biased NOx sensor, or poor regen history.', 'Check DEF concentration, dosing, exhaust leaks, NOx sensor plausibility, then run OEM SCR test.', 'Do not replace outlet NOx sensor without checking dosing and leaks.', 0.80)
on conflict do nothing;


-- PHASE 4 FIELD TOOLS PRO TABLES
create table if not exists field_jobs (
  id bigint generated always as identity primary key,
  vin text,
  truck text,
  customer_name text,
  customer_phone text,
  location_name text,
  gps_coordinates text,
  roadside_status text,
  eta_update text,
  checklist text,
  field_note text,
  created_at timestamptz default now()
);

create table if not exists field_photos (
  id bigint generated always as identity primary key,
  vin text,
  job_id bigint,
  photo_note text,
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists offline_sync_log (
  id bigint generated always as identity primary key,
  vin text,
  item_type text,
  payload jsonb,
  synced boolean default false,
  created_at timestamptz default now()
);


-- PHASE 5 OCR / VISION PRO
create table if not exists photo_notes (
  id bigint generated always as identity primary key,
  vin text,
  note_type text,
  cleaned_text text,
  raw_text text,
  notes text,
  created_at timestamptz default now()
);


-- =====================================================
-- PHASE 7 BACKEND EXPANSION PRO
-- Run this after earlier Phase 1-6 tables.
-- Safe to run multiple times.
-- =====================================================

create table if not exists staging_catalog_imports (
  id bigint generated always as identity primary key,
  source_name text,
  system_category text,
  brand_a text,
  part_a text,
  brand_b text,
  part_b text,
  description text,
  confidence numeric default 0.95,
  raw_payload jsonb,
  notes text,
  processed boolean default false,
  created_at timestamptz default now()
);

create table if not exists supplier_pricing (
  id bigint generated always as identity primary key,
  part_number text,
  supplier_name text,
  brand text,
  price numeric,
  availability text,
  search_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists repair_procedures (
  id bigint generated always as identity primary key,
  engine_family text,
  component_name text,
  procedure_name text,
  steps text,
  tools_required text,
  warnings text,
  source_name text,
  created_at timestamptz default now()
);

create table if not exists known_failures (
  id bigint generated always as identity primary key,
  engine_family text,
  platform text,
  fault_code text,
  symptom text,
  likely_failure text,
  common_fix text,
  confidence_score numeric default 0.75,
  notes text,
  created_at timestamptz default now()
);

create table if not exists vin_history_expanded (
  id bigint generated always as identity primary key,
  vin text,
  engine_family text,
  event_type text,
  part_number text,
  fault_code text,
  notes text,
  confidence_score numeric,
  created_at timestamptz default now()
);

-- Helpful indexes for field speed
create index if not exists idx_parts_part_number on parts(part_number);
create index if not exists idx_parts_description on parts(description);
create index if not exists idx_part_cross_refs_part_id on part_cross_refs(part_id);
create index if not exists idx_part_cross_refs_cross_ref_id on part_cross_refs(cross_ref_id);
create index if not exists idx_repair_kits_component on repair_kits(component_name);
create index if not exists idx_torque_specs_component on torque_specs(component_name);
create index if not exists idx_labor_times_component on labor_times(component_name);
create index if not exists idx_known_failures_fault on known_failures(fault_code);
create index if not exists idx_staging_catalog_imports_processed on staging_catalog_imports(processed);
create index if not exists idx_supplier_pricing_part on supplier_pricing(part_number);
create index if not exists idx_vin_history_expanded_vin on vin_history_expanded(vin);

-- Recursive interchange chain for normalized parts + part_cross_refs.
create or replace function recursive_interchange_chain(search_text text)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  with recursive seed as (
    select p.id, p.part_number, coalesce(m.name,'UNKNOWN') as manufacturer, p.description
    from parts p
    left join manufacturers m on m.id = p.manufacturer_id
    where p.part_number ilike '%' || search_text || '%'
    limit 10
  ), chain as (
    select
      s.id as source_id,
      s.part_number as source_part,
      s.manufacturer as source_brand,
      p2.id as cross_id,
      p2.part_number as cross_part,
      coalesce(m2.name,'UNKNOWN') as cross_brand,
      pcr.confidence_score,
      1 as depth
    from seed s
    join part_cross_refs pcr on pcr.part_id = s.id
    join parts p2 on p2.id = pcr.cross_ref_id
    left join manufacturers m2 on m2.id = p2.manufacturer_id

    union

    select
      c.cross_id as source_id,
      c.cross_part as source_part,
      c.cross_brand as source_brand,
      p2.id as cross_id,
      p2.part_number as cross_part,
      coalesce(m2.name,'UNKNOWN') as cross_brand,
      pcr.confidence_score,
      c.depth + 1
    from chain c
    join part_cross_refs pcr on pcr.part_id = c.cross_id
    join parts p2 on p2.id = pcr.cross_ref_id
    left join manufacturers m2 on m2.id = p2.manufacturer_id
    where c.depth < 5
  )
  select coalesce(jsonb_agg(to_jsonb(chain)), '[]'::jsonb) into result
  from chain;

  return result;
end;
$$;

-- Expanded backend search. Returns grouped JSON for the app cards.
create or replace function backend_expansion_search(search_text text)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  result := jsonb_build_object(
    'parts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'part_number', p.part_number,
        'manufacturer', coalesce(m.name,'UNKNOWN'),
        'description', p.description,
        'category', p.category
      )), '[]'::jsonb)
      from parts p
      left join manufacturers m on m.id = p.manufacturer_id
      where p.part_number ilike '%' || search_text || '%'
         or p.description ilike '%' || search_text || '%'
         or p.category ilike '%' || search_text || '%'
         or m.name ilike '%' || search_text || '%'
      limit 25
    ),
    'cross_refs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'source_part', p1.part_number,
        'source_brand', coalesce(m1.name,'UNKNOWN'),
        'cross_part', p2.part_number,
        'cross_brand', coalesce(m2.name,'UNKNOWN'),
        'confidence_score', pcr.confidence_score
      )), '[]'::jsonb)
      from part_cross_refs pcr
      join parts p1 on p1.id = pcr.part_id
      join parts p2 on p2.id = pcr.cross_ref_id
      left join manufacturers m1 on m1.id = p1.manufacturer_id
      left join manufacturers m2 on m2.id = p2.manufacturer_id
      where p1.part_number ilike '%' || search_text || '%'
         or p2.part_number ilike '%' || search_text || '%'
         or p1.description ilike '%' || search_text || '%'
         or p2.description ilike '%' || search_text || '%'
      limit 25
    ),
    'interchange_chains', recursive_interchange_chain(search_text),
    'torque_specs', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from torque_specs t
      where t.engine_family ilike '%' || search_text || '%'
         or t.component_name ilike '%' || search_text || '%'
         or t.fastener ilike '%' || search_text || '%'
         or t.torque_value ilike '%' || search_text || '%'
      limit 20
    ),
    'labor_times', (
      select coalesce(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
      from labor_times l
      where l.engine_family ilike '%' || search_text || '%'
         or l.component_name ilike '%' || search_text || '%'
         or l.labor_operation ilike '%' || search_text || '%'
         or l.notes ilike '%' || search_text || '%'
      limit 20
    ),
    'fluids_filters', (
      select coalesce(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
      from fluids_filters f
      where f.engine_family ilike '%' || search_text || '%'
         or f.service_type ilike '%' || search_text || '%'
         or f.oil_filter ilike '%' || search_text || '%'
         or f.fuel_filter ilike '%' || search_text || '%'
         or f.water_separator ilike '%' || search_text || '%'
      limit 20
    ),
    'known_failures', (
      select coalesce(jsonb_agg(to_jsonb(k)), '[]'::jsonb)
      from known_failures k
      where k.engine_family ilike '%' || search_text || '%'
         or k.platform ilike '%' || search_text || '%'
         or k.fault_code ilike '%' || search_text || '%'
         or k.symptom ilike '%' || search_text || '%'
         or k.likely_failure ilike '%' || search_text || '%'
         or k.common_fix ilike '%' || search_text || '%'
      limit 20
    ),
    'repair_procedures', (
      select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
      from repair_procedures r
      where r.engine_family ilike '%' || search_text || '%'
         or r.component_name ilike '%' || search_text || '%'
         or r.procedure_name ilike '%' || search_text || '%'
         or r.steps ilike '%' || search_text || '%'
      limit 15
    ),
    'supplier_pricing', (
      select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
      from supplier_pricing s
      where s.part_number ilike '%' || search_text || '%'
         or s.supplier_name ilike '%' || search_text || '%'
         or s.brand ilike '%' || search_text || '%'
      limit 20
    ),
    'staging_imports', (
      select coalesce(jsonb_agg(to_jsonb(si)), '[]'::jsonb)
      from staging_catalog_imports si
      where si.source_name ilike '%' || search_text || '%'
         or si.system_category ilike '%' || search_text || '%'
         or si.part_a ilike '%' || search_text || '%'
         or si.part_b ilike '%' || search_text || '%'
         or si.description ilike '%' || search_text || '%'
      limit 15
    )
  );

  return result;
end;
$$;

-- Optional: import rows from staging_catalog_imports into normalized parts/cross refs.
create or replace function process_staging_catalog_imports()
returns integer
language plpgsql
as $$
declare
  processed_count integer := 0;
  r record;
  brand_a_id uuid;
  brand_b_id uuid;
  part_a_id uuid;
  part_b_id uuid;
begin
  for r in select * from staging_catalog_imports where processed = false loop
    if coalesce(r.brand_a,'') <> '' then
      insert into manufacturers(name) values(r.brand_a) on conflict(name) do nothing;
      select id into brand_a_id from manufacturers where name = r.brand_a limit 1;
    end if;
    if coalesce(r.brand_b,'') <> '' then
      insert into manufacturers(name) values(r.brand_b) on conflict(name) do nothing;
      select id into brand_b_id from manufacturers where name = r.brand_b limit 1;
    end if;

    if coalesce(r.part_a,'') <> '' then
      insert into parts(part_number, manufacturer_id, description, category)
      values(r.part_a, brand_a_id, r.description, r.system_category)
      on conflict do nothing;
      select id into part_a_id from parts where part_number = r.part_a and (manufacturer_id = brand_a_id or brand_a_id is null) limit 1;
    end if;

    if coalesce(r.part_b,'') <> '' then
      insert into parts(part_number, manufacturer_id, description, category)
      values(r.part_b, brand_b_id, r.description, r.system_category)
      on conflict do nothing;
      select id into part_b_id from parts where part_number = r.part_b and (manufacturer_id = brand_b_id or brand_b_id is null) limit 1;
    end if;

    if part_a_id is not null and part_b_id is not null then
      insert into part_cross_refs(part_id, cross_ref_id, confidence_score)
      values(part_a_id, part_b_id, coalesce(r.confidence,0.95))
      on conflict do nothing;
    end if;

    update staging_catalog_imports set processed = true where id = r.id;
    processed_count := processed_count + 1;
  end loop;
  return processed_count;
end;
$$;


-- PHASE 8 FINAL INTEGRATION PRO
-- Unified job session tracking across VIN, parts, diagnostics, invoice, and field tools.
create table if not exists unified_job_sessions (
  id bigint generated always as identity primary key,
  vin text,
  customer_name text,
  truck text,
  status text default 'ACTIVE',
  last_query text,
  invoice_text text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_unified_job_sessions_vin on unified_job_sessions(vin);
create index if not exists idx_unified_job_sessions_created_at on unified_job_sessions(created_at desc);


-- PHASE 9 QA / DEBUG / STABILITY PRO
create table if not exists debug_reports (
  id bigint generated always as identity primary key,
  report_type text,
  app_version text,
  device_info text,
  error_message text,
  report_json jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_debug_reports_created_at on debug_reports(created_at desc);


-- PHASE 10 FINAL RELEASE PRO
create table if not exists app_release_events (
  id bigint generated always as identity primary key,
  app_version text,
  event_type text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists local_backup_index (
  id bigint generated always as identity primary key,
  vin text,
  backup_type text,
  backup_notes text,
  created_at timestamptz default now()
);


-- PHASE 11 ROLLING CECIL AI BRAIN
-- Vector-ready schema for semantic manuals, repair memory, and X-Ray photo mapping.
create extension if not exists vector;

create table if not exists knowledge_base_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_type text,
  source_name text,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists repair_memory (
  id uuid primary key default gen_random_uuid(),
  vin text,
  vin_prefix text,
  fault_code text,
  symptom_text text,
  symptom_vector vector(1536),
  resolution_id uuid,
  repair_action text,
  ranking_score float default 1.0,
  verified_fix boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists component_photo_map (
  id uuid primary key default gen_random_uuid(),
  vin text,
  component_id text,
  component_name text,
  photo_path text,
  bounding_box jsonb default '{}'::jsonb,
  confidence_score float default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists ai_router_events (
  id bigint generated always as identity primary key,
  vin text,
  route_level text,
  query_text text,
  selected_sources jsonb default '[]'::jsonb,
  model_used text,
  response_summary text,
  created_at timestamptz default now()
);

create index if not exists idx_knowledge_metadata on knowledge_base_embeddings using gin(metadata);
create index if not exists idx_knowledge_content on knowledge_base_embeddings using gin(to_tsvector('english', content));
create index if not exists idx_repair_memory_vin_fault on repair_memory(vin_prefix, fault_code);
create index if not exists idx_repair_memory_symptom on repair_memory using gin(to_tsvector('english', coalesce(symptom_text,'') || ' ' || coalesce(repair_action,'')));
create index if not exists idx_component_photo_map_vin_component on component_photo_map(vin, component_id);

-- Vector indexes only work after enough rows exist; safe to create now for future semantic search.
do $$
begin
  begin
    create index if not exists knowledge_embedding_idx on knowledge_base_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
  exception when others then
    raise notice 'knowledge embedding index skipped: %', sqlerrm;
  end;
  begin
    create index if not exists repair_memory_vector_idx on repair_memory using ivfflat (symptom_vector vector_cosine_ops) with (lists = 100);
  exception when others then
    raise notice 'repair memory vector index skipped: %', sqlerrm;
  end;
end $$;

create or replace function rolling_cecil_brain_search(search_text text)
returns jsonb
language plpgsql
as $$
begin
  return jsonb_build_object(
    'query', search_text,
    'router_level', case
      when search_text ~ '^[A-Za-z0-9\\-]{4,}$' then 'Level 1 / Exact Lookup Candidate'
      else 'Level 2 / Semantic Search Candidate'
    end,
    'knowledge', (
      select coalesce(jsonb_agg(to_jsonb(k) order by k.created_at desc), '[]'::jsonb)
      from (
        select id, source_type, source_name, content, metadata, created_at
        from knowledge_base_embeddings
        where content ilike '%' || search_text || '%'
           or metadata::text ilike '%' || search_text || '%'
        limit 5
      ) k
    ),
    'repair_memory', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.verified_fix desc, r.ranking_score desc, r.created_at desc), '[]'::jsonb)
      from (
        select id, vin, vin_prefix, fault_code, symptom_text, repair_action, ranking_score, verified_fix, metadata, created_at
        from repair_memory
        where fault_code ilike '%' || search_text || '%'
           or symptom_text ilike '%' || search_text || '%'
           or repair_action ilike '%' || search_text || '%'
           or metadata::text ilike '%' || search_text || '%'
        limit 5
      ) r
    ),
    'component_maps', (
      select coalesce(jsonb_agg(to_jsonb(c) order by c.confidence_score desc, c.created_at desc), '[]'::jsonb)
      from (
        select id, vin, component_id, component_name, photo_path, confidence_score, metadata, created_at
        from component_photo_map
        where component_name ilike '%' || search_text || '%'
           or component_id ilike '%' || search_text || '%'
           or metadata::text ilike '%' || search_text || '%'
        limit 5
      ) c
    )
  );
end;
$$;

create or replace function repair_memory_search(search_text text, vin_text text default null)
returns jsonb
language plpgsql
as $$
declare
  prefix text := null;
begin
  if vin_text is not null then
    prefix := left(vin_text, 10);
  end if;

  return jsonb_build_object(
    'query', search_text,
    'vin_prefix', prefix,
    'repair_memory', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.verified_fix desc, r.ranking_score desc, r.created_at desc), '[]'::jsonb)
      from (
        select id, vin, vin_prefix, fault_code, symptom_text, repair_action, ranking_score, verified_fix, metadata, created_at
        from repair_memory
        where (prefix is null or vin_prefix = prefix or vin = vin_text)
          and (
            fault_code ilike '%' || search_text || '%'
            or symptom_text ilike '%' || search_text || '%'
            or repair_action ilike '%' || search_text || '%'
            or metadata::text ilike '%' || search_text || '%'
          )
        limit 10
      ) r
    )
  );
end;
$$;

create or replace function match_knowledge_by_embedding(query_embedding vector(1536), match_count int default 5)
returns table (
  id uuid,
  source_type text,
  source_name text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    k.id,
    k.source_type,
    k.source_name,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) as similarity
  from knowledge_base_embeddings k
  where k.embedding is not null
  order by k.embedding <=> query_embedding
  limit match_count;
$$;

-- PHASE 12 LIVE SEMANTIC RETRIEVAL
-- Adds source-backed retrieval, repair-memory ranking, and router event logging.
create table if not exists semantic_search_events (
  id bigint generated always as identity primary key,
  vin text,
  search_text text,
  route_level text,
  knowledge_hits int default 0,
  repair_hits int default 0,
  failure_hits int default 0,
  created_at timestamptz default now()
);

create table if not exists manual_ingestion_queue (
  id bigint generated always as identity primary key,
  source_name text,
  source_type text,
  category text,
  raw_text text,
  status text default 'queued',
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_semantic_search_events_created on semantic_search_events(created_at desc);
create index if not exists idx_manual_ingestion_status on manual_ingestion_queue(status, created_at desc);
create index if not exists idx_manual_ingestion_text on manual_ingestion_queue using gin(to_tsvector('english', coalesce(raw_text,'') || ' ' || coalesce(notes,'')));

create or replace function rolling_cecil_live_retrieval(search_text text, vin_text text default null)
returns jsonb
language plpgsql
as $$
declare
  prefix text := null;
  clean_text text := trim(coalesce(search_text,''));
  k_hits int := 0;
  r_hits int := 0;
  f_hits int := 0;
  output jsonb;
begin
  if vin_text is not null and length(vin_text) >= 8 then
    prefix := left(vin_text, 10);
  end if;

  output := jsonb_build_object(
    'query', clean_text,
    'vin_prefix', prefix,
    'route_plan', jsonb_build_object(
      'level', case
        when clean_text ~ '^[A-Za-z0-9\-]{4,}$' then 'Level 1 + Live Retrieval'
        else 'Level 2 + Live Retrieval'
      end,
      'route', 'Exact SQL + keyword semantic retrieval + repair memory ranking',
      'llm_needed', false,
      'reason', 'Return grounded shop data first. Use LLM only after sources are gathered.'
    ),
    'knowledge', (
      select coalesce(jsonb_agg(to_jsonb(k) order by k.score desc, k.created_at desc), '[]'::jsonb)
      from (
        select
          id,
          source_type,
          source_name,
          content,
          metadata,
          created_at,
          greatest(
            ts_rank_cd(to_tsvector('english', coalesce(content,'') || ' ' || coalesce(metadata::text,'')), plainto_tsquery('english', clean_text)),
            case when content ilike '%' || clean_text || '%' then 1.0 else 0 end,
            case when metadata::text ilike '%' || clean_text || '%' then 0.75 else 0 end
          ) as score
        from knowledge_base_embeddings
        where clean_text <> ''
          and (
            content ilike '%' || clean_text || '%'
            or metadata::text ilike '%' || clean_text || '%'
            or to_tsvector('english', coalesce(content,'') || ' ' || coalesce(metadata::text,'')) @@ plainto_tsquery('english', clean_text)
          )
        order by score desc, created_at desc
        limit 8
      ) k
    ),
    'repair_memory', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.verified_fix desc, r.score desc, r.ranking_score desc, r.created_at desc), '[]'::jsonb)
      from (
        select
          id,
          vin,
          vin_prefix,
          fault_code,
          symptom_text,
          repair_action,
          ranking_score,
          verified_fix,
          metadata,
          created_at,
          (
            coalesce(ranking_score,0)
            + case when verified_fix then 2 else 0 end
            + case when prefix is not null and (vin_prefix = prefix or vin = vin_text) then 2 else 0 end
            + case when fault_code ilike '%' || clean_text || '%' then 1.5 else 0 end
            + case when symptom_text ilike '%' || clean_text || '%' then 1 else 0 end
            + case when repair_action ilike '%' || clean_text || '%' then 1 else 0 end
            + ts_rank_cd(to_tsvector('english', coalesce(symptom_text,'') || ' ' || coalesce(repair_action,'') || ' ' || coalesce(metadata::text,'')), plainto_tsquery('english', clean_text))
          ) as score
        from repair_memory
        where clean_text <> ''
          and (
            fault_code ilike '%' || clean_text || '%'
            or symptom_text ilike '%' || clean_text || '%'
            or repair_action ilike '%' || clean_text || '%'
            or metadata::text ilike '%' || clean_text || '%'
            or to_tsvector('english', coalesce(symptom_text,'') || ' ' || coalesce(repair_action,'') || ' ' || coalesce(metadata::text,'')) @@ plainto_tsquery('english', clean_text)
            or (prefix is not null and (vin_prefix = prefix or vin = vin_text))
          )
        order by verified_fix desc, score desc, ranking_score desc, created_at desc
        limit 10
      ) r
    ),
    'common_failures', (
      select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc), '[]'::jsonb)
      from (
        select id, fault_code, symptom, engine_family, likely_causes, common_fix, tech_notes, created_at
        from common_failures
        where clean_text <> ''
          and (
            fault_code ilike '%' || clean_text || '%'
            or symptom ilike '%' || clean_text || '%'
            or engine_family ilike '%' || clean_text || '%'
            or likely_causes ilike '%' || clean_text || '%'
            or common_fix ilike '%' || clean_text || '%'
          )
        limit 8
      ) c
    ),
    'diagnostic_tests', (
      select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at desc), '[]'::jsonb)
      from (
        select id, engine_family, fault_code, symptom, test_name, test_steps, pass_fail_specs, next_step_if_failed, notes, created_at
        from diagnostic_tests
        where clean_text <> ''
          and (
            engine_family ilike '%' || clean_text || '%'
            or fault_code ilike '%' || clean_text || '%'
            or symptom ilike '%' || clean_text || '%'
            or test_name ilike '%' || clean_text || '%'
            or test_steps ilike '%' || clean_text || '%'
          )
        limit 8
      ) d
    ),
    'known_patterns', (
      select coalesce(jsonb_agg(to_jsonb(kf) order by kf.created_at desc), '[]'::jsonb)
      from (
        select id, fault_code, symptom, engine_family, common_fix, created_at
        from known_failures
        where clean_text <> ''
          and (
            fault_code ilike '%' || clean_text || '%'
            or symptom ilike '%' || clean_text || '%'
            or engine_family ilike '%' || clean_text || '%'
            or common_fix ilike '%' || clean_text || '%'
          )
        limit 8
      ) kf
    ),
    'component_maps', (
      select coalesce(jsonb_agg(to_jsonb(cm) order by cm.confidence_score desc, cm.created_at desc), '[]'::jsonb)
      from (
        select id, vin, component_id, component_name, photo_path, confidence_score, metadata, created_at
        from component_photo_map
        where clean_text <> ''
          and (
            component_name ilike '%' || clean_text || '%'
            or component_id ilike '%' || clean_text || '%'
            or metadata::text ilike '%' || clean_text || '%'
            or (prefix is not null and vin = vin_text)
          )
        limit 8
      ) cm
    )
  );

  k_hits := jsonb_array_length(coalesce(output->'knowledge','[]'::jsonb));
  r_hits := jsonb_array_length(coalesce(output->'repair_memory','[]'::jsonb));
  f_hits := jsonb_array_length(coalesce(output->'common_failures','[]'::jsonb)) + jsonb_array_length(coalesce(output->'known_patterns','[]'::jsonb));

  insert into semantic_search_events(vin, search_text, route_level, knowledge_hits, repair_hits, failure_hits)
  values(vin_text, clean_text, output#>>'{route_plan,level}', k_hits, r_hits, f_hits);

  return output;
end;
$$;

-- Seed a few source-backed field notes if they are not already present.
insert into knowledge_base_embeddings(source_type, source_name, content, metadata)
select 'Case Study', 'Rolling Wrench Diesel Field Note', 'Cummins X15 with stutter at idle and no active fault codes: check fuel pressure, restricted fuel filters, air in fuel, injector return flow, EGR valve sticking, and aftertreatment restriction before replacing injectors.', '{"engine":"Cummins X15","category":"Diagnostic","component":"Fuel / EGR","phase":"12"}'::jsonb
where not exists (select 1 from knowledge_base_embeddings where content ilike '%Cummins X15 with stutter at idle%');

insert into knowledge_base_embeddings(source_type, source_name, content, metadata)
select 'Case Study', 'Rolling Wrench Diesel Field Note', 'Detroit DD15 with outlet NOx efficiency fault: verify DEF quality, SCR efficiency, exhaust leaks, dosing amount, DEF pressure, crystallization, and regen history before replacing the NOx sensor.', '{"engine":"Detroit DD15","category":"Aftertreatment","component":"SCR / NOx","phase":"12"}'::jsonb
where not exists (select 1 from knowledge_base_embeddings where content ilike '%Detroit DD15 with outlet NOx efficiency fault%');

insert into repair_memory(vin, vin_prefix, fault_code, symptom_text, repair_action, ranking_score, verified_fix, metadata)
select '3HSDZAPR6HN674950', '3HSDZAPR6H', 'No Code', 'Cummins X15 stutter at idle', 'Checked fuel restriction first. Replaced restricted fuel filter and verified no air intrusion.', 2.0, true, '{"engine":"Cummins X15","repair_type":"Fuel Diagnostic","phase":"12"}'::jsonb
where not exists (select 1 from repair_memory where symptom_text ilike '%Cummins X15 stutter at idle%' and verified_fix = true);


-- =========================================================
-- PHASE 13 — REAL EMBEDDINGS + RAG INGESTION BACKEND
-- =========================================================
create extension if not exists vector;

create table if not exists embedding_ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  source_type text,
  status text default 'queued',
  raw_text text,
  chunk_count integer default 0,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  processed_at timestamptz
);

create table if not exists embedding_router_events (
  id uuid primary key default gen_random_uuid(),
  query_text text,
  route_level text,
  lookup_hits integer default 0,
  semantic_hits integer default 0,
  repair_memory_hits integer default 0,
  llm_used boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table knowledge_base_embeddings add column if not exists chunk_index integer default 0;
alter table knowledge_base_embeddings add column if not exists token_estimate integer default 0;
alter table knowledge_base_embeddings add column if not exists source_url text;
alter table manual_ingestion_queue add column if not exists processed_at timestamptz;
alter table manual_ingestion_queue add column if not exists chunk_count integer default 0;

create index if not exists kbe_content_trgm_idx on knowledge_base_embeddings using gin (content gin_trgm_ops);
create index if not exists kbe_source_type_idx on knowledge_base_embeddings (source_type);
create index if not exists rm_fault_text_idx on repair_memory (fault_code);

create or replace function queue_embedding_ingestion(
  source_name_text text,
  source_type_text text,
  raw_text_input text,
  metadata_input jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
as $$
declare
  job_id uuid;
begin
  insert into embedding_ingestion_jobs (source_name, source_type, raw_text, metadata)
  values (source_name_text, source_type_text, raw_text_input, metadata_input)
  returning id into job_id;

  insert into manual_ingestion_queue (source_name, source_type, raw_text, status, metadata)
  values (source_name_text, source_type_text, raw_text_input, 'queued', metadata_input);

  return jsonb_build_object('status','queued','job_id',job_id,'source_name',source_name_text);
end;
$$;

create or replace function rolling_cecil_hybrid_rag_search(search_text text, vin_text text default null)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
  lookup_count integer := 0;
  knowledge_count integer := 0;
  memory_count integer := 0;
begin
  select count(*) into knowledge_count
  from knowledge_base_embeddings k
  where k.content ilike '%' || search_text || '%'
     or k.source_name ilike '%' || search_text || '%'
     or k.source_type ilike '%' || search_text || '%';

  select count(*) into memory_count
  from repair_memory r
  where r.symptom_text ilike '%' || search_text || '%'
     or r.fault_code ilike '%' || search_text || '%'
     or r.repair_action ilike '%' || search_text || '%'
     or (vin_text is not null and r.vin = vin_text);

  result := jsonb_build_object(
    'route','phase13_hybrid_rag',
    'query', search_text,
    'vin', vin_text,
    'knowledge', (
      select coalesce(jsonb_agg(to_jsonb(k)), '[]'::jsonb)
      from (
        select id, source_type, source_name, content, metadata, created_at
        from knowledge_base_embeddings
        where content ilike '%' || search_text || '%'
           or source_name ilike '%' || search_text || '%'
           or source_type ilike '%' || search_text || '%'
        order by created_at desc
        limit 8
      ) k
    ),
    'repair_memory', (
      select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
      from (
        select id, vin, vin_prefix, fault_code, symptom_text, repair_action, ranking_score, verified_fix, metadata, created_at
        from repair_memory
        where symptom_text ilike '%' || search_text || '%'
           or fault_code ilike '%' || search_text || '%'
           or repair_action ilike '%' || search_text || '%'
           or (vin_text is not null and vin = vin_text)
        order by verified_fix desc, ranking_score desc, created_at desc
        limit 8
      ) r
    ),
    'router_note', 'Phase 13: exact SQL + repair memory + knowledge lookup. Vector similarity becomes active after embeddings are generated by Edge Function.'
  );

  insert into embedding_router_events (query_text, route_level, lookup_hits, semantic_hits, repair_memory_hits, llm_used, metadata)
  values (search_text, 'hybrid_rag_sql_first', lookup_count, knowledge_count, memory_count, false, jsonb_build_object('vin', vin_text));

  return result;
end;
$$;

insert into knowledge_base_embeddings (source_type, source_name, content, metadata)
values
('Case Study','Phase 13 Seed - X15 Idle Stutter','Cummins X15 stutter at idle: verify fuel restriction, fuel pressure, air intrusion, injector return, EGR valve movement, intake leaks, exhaust restriction, and aftertreatment derate history before replacing injectors.', '{"engine":"Cummins X15","category":"Diagnostic","phase":"13"}'::jsonb),
('Case Study','Phase 13 Seed - DD15 NOx Efficiency','Detroit DD15 outlet NOx efficiency: verify DEF quality, DEF dosing quantity, exhaust leaks, SCR temperature profile, crystallization, DEF pressure, and regen history before replacing NOx sensors.', '{"engine":"Detroit DD15","category":"Aftertreatment","phase":"13"}'::jsonb)
on conflict do nothing;
