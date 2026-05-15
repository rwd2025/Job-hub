-- =====================================================
-- ROLLING CECIL AI - PHASE 20
-- SMART REPAIR KIT LOGIC
-- Adds: related parts, labor hints, torque notes, while-you're-there checks
-- =====================================================

create extension if not exists "uuid-ossp";

-- Smart repair kit table
create table if not exists smart_repair_kits (
  id uuid primary key default uuid_generate_v4(),
  engine_canonical_id text,
  engine_family text,
  component text not null,
  primary_oem text,
  primary_alt text,
  kit_name text,
  gaskets text[],
  seals text[],
  o_rings text[],
  hardware text[],
  fluids text[],
  related_parts text[],
  while_there_checks text[],
  common_failures text[],
  labor_hours numeric,
  torque_notes text,
  repair_notes text,
  confidence numeric default 0.80,
  created_at timestamptz default now()
);

create index if not exists idx_smart_repair_kits_engine_component
on smart_repair_kits (engine_family, component);

create index if not exists idx_smart_repair_kits_oem
on smart_repair_kits (primary_oem);

-- Starter X15 water pump kit
insert into smart_repair_kits (
  engine_canonical_id,
  engine_family,
  component,
  primary_oem,
  primary_alt,
  kit_name,
  gaskets,
  seals,
  o_rings,
  hardware,
  fluids,
  related_parts,
  while_there_checks,
  common_failures,
  labor_hours,
  torque_notes,
  repair_notes,
  confidence
)
values (
  'CUM_X15',
  'X15',
  'water pump',
  '3692580',
  '3692580RX',
  'Cummins X15 / ISX15 Water Pump Repair Kit',
  array['Water pump gasket / mounting seal - verify by ESN/CPL'],
  array['Front coolant seal - verify by ESN/CPL'],
  array['Coolant O-ring set if pipe connections are removed'],
  array['Mounting bolts recommended if corroded or stretched'],
  array['Coolant refill - use OEM-approved coolant spec', 'Distilled water if concentrate is used'],
  array['Serpentine belt', 'Belt tensioner', 'Idler pulley', 'Thermostat housing gasket if disturbed'],
  array[
    'Inspect belt tensioner play',
    'Inspect idler pulley bearing',
    'Check coolant contamination',
    'Pressure test cooling system after repair',
    'Verify no fan hub / belt alignment issue'
  ],
  array[
    'Coolant leak at weep hole',
    'Bearing play / wobble',
    'Overheating under load',
    'Belt tracking issue causing pump wear'
  ],
  4.5,
  'Verify torque sequence and values by Cummins service information using ESN/CPL before final assembly.',
  'Drain coolant fully. Clean sealing surface. Do not reuse damaged gasket. Refill and bleed cooling system. Pressure test after repair.',
  0.92
)
on conflict do nothing;


-- Smart Repair Kit Lookup Function
create or replace function smart_repair_kit_lookup(
  part_query text,
  raw_engine_text text default null,
  oem_text text default null
)
returns json
language plpgsql
as $$
declare
  v_norm record;
  v_kit json;
  v_component text;
begin

  v_component := lower(coalesce(part_query, ''));

  -- normalize engine
  if raw_engine_text is not null and trim(raw_engine_text) <> '' then
    select *
    into v_norm
    from engine_normalization_map e
    where lower(e.raw_string) = lower(raw_engine_text)
       or lower(e.canonical_name) = lower(raw_engine_text)
    order by e.confidence desc
    limit 1;
  end if;

  -- First strict kit match
  select coalesce(json_agg(x), '[]'::json)
  into v_kit
  from (
    select *
    from smart_repair_kits k
    where
      (
        lower(k.component) ilike '%' || v_component || '%'
        or v_component ilike '%' || lower(k.component) || '%'
        or (oem_text is not null and (k.primary_oem = oem_text or k.primary_alt = oem_text))
      )
      and (
        v_norm is null
        or k.engine_canonical_id = v_norm.canonical_id
        or lower(k.engine_family) = lower(v_norm.canonical_name)
      )
    order by k.confidence desc
    limit 5
  ) x;

  -- Broad fallback
  if coalesce(json_array_length(v_kit), 0) = 0 then
    select coalesce(json_agg(y), '[]'::json)
    into v_kit
    from (
      select *
      from smart_repair_kits k
      where
        lower(k.component) ilike '%' || v_component || '%'
        or v_component ilike '%' || lower(k.component) || '%'
        or (oem_text is not null and (k.primary_oem = oem_text or k.primary_alt = oem_text))
      order by k.confidence desc
      limit 5
    ) y;
  end if;

  return json_build_object(
    'status','ok',
    'query',part_query,
    'engine',raw_engine_text,
    'oem',oem_text,
    'normalized_engine', case
      when v_norm is null then null
      else json_build_object(
        'canonical_id', v_norm.canonical_id,
        'canonical_name', v_norm.canonical_name,
        'manufacturer', v_norm.manufacturer,
        'epa_standard', v_norm.epa_standard
      )
    end,
    'repair_kits', v_kit,
    'answer_style', 'tech repair kit',
    'verify', 'Verify all gaskets, seals, torque specs, and fitment by VIN/ESN/CPL before ordering or final assembly.'
  );

end;
$$;


-- Combined parts + kit answer
create or replace function parts_tech_repair_answer(
  part_query text,
  raw_engine_text text default null
)
returns json
language plpgsql
as $$
declare
  v_parts json;
  v_kits json;
  v_oem text;
begin

  select parts_tech_answer(part_query, raw_engine_text)
  into v_parts;

  -- Pull first OEM from parts answer if present
  select (elem->>'oem_number')
  into v_oem
  from json_array_elements(coalesce(v_parts->'parts','[]'::json)) elem
  where elem ? 'oem_number'
  limit 1;

  select smart_repair_kit_lookup(part_query, raw_engine_text, v_oem)
  into v_kits;

  return json_build_object(
    'status','ok',
    'part_answer', v_parts,
    'repair_kit_answer', v_kits,
    'tech_rule','Return OEM part number first, then repair kit, labor, related parts, and verification warning.'
  );

end;
$$;


-- Tests
select parts_tech_repair_answer('water pump', 'X15');
select smart_repair_kit_lookup('water pump', 'X15', '3692580');