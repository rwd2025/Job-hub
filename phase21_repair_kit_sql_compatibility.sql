
-- ============================================================
-- ROLLING CECIL AI - PHASE 21 SQL COMPATIBILITY PATCH
-- Makes repair_kits table work with both old and new frontend logic.
-- Run in Supabase SQL Editor.
-- ============================================================

alter table repair_kits
add column if not exists component text,
add column if not exists part_type text,
add column if not exists oem_part text,
add column if not exists alt_part text,
add column if not exists labor_hours numeric,
add column if not exists notes text;

-- Keep component and part_type synced for old/new code
update repair_kits
set component = coalesce(component, part_type)
where component is null and part_type is not null;

update repair_kits
set part_type = coalesce(part_type, component)
where part_type is null and component is not null;

-- Upsert X15 water pump kit
insert into repair_kits (
  engine_family,
  component,
  part_type,
  oem_part,
  alt_part,
  labor_hours,
  notes
)
values (
  'X15',
  'water pump',
  'water pump',
  '3692580',
  '3692580RX',
  4.5,
  'Replace thermostat seals if disturbed, inspect belt/tensioner/idlers, refill coolant, bleed system, pressure test after repair.'
);

-- Upsert DD15 water pump kit
insert into repair_kits (
  engine_family,
  component,
  part_type,
  oem_part,
  alt_part,
  labor_hours,
  notes
)
values (
  'DD15',
  'water pump',
  'water pump',
  'A4722001601',
  'A4722001601RX',
  5.2,
  'Inspect coolant manifold and pulley alignment. Prime and bleed cooling system after repair.'
);

-- Upsert MX13 water pump kit
insert into repair_kits (
  engine_family,
  component,
  part_type,
  oem_part,
  alt_part,
  labor_hours,
  notes
)
values (
  'MX13',
  'water pump',
  'water pump',
  '2267065PE',
  '2267065PEX',
  5.0,
  'Inspect idler pulley and fan hub for coolant contamination. Verify by VIN/engine serial.'
);

-- Test
select *
from repair_kits
where engine_family = 'X15'
and (
  component ilike '%water pump%'
  or part_type ilike '%water pump%'
);
