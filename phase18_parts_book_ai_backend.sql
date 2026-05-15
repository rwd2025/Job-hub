-- =========================================================
-- ROLLING CECIL AI - PHASE 18 CLEAN BACKEND PATCH
-- Engine normalization + Big 4 parts + smart part lookup
-- =========================================================

create extension if not exists "uuid-ossp";

create table if not exists canonical_engines (
  id text primary key,
  common_name text not null,
  manufacturer text not null,
  notes text,
  created_at timestamptz default now()
);

insert into canonical_engines (id, common_name, manufacturer, notes) values
('CUM_X15', 'Cummins X15', 'Cummins', 'Cummins ISX15 / X15 family'),
('DET_DD13', 'Detroit DD13', 'Detroit', 'Detroit DD13 / OM471 family'),
('DET_DD15', 'Detroit DD15', 'Detroit', 'Detroit DD15 / OM472 family'),
('PAC_MX13', 'PACCAR MX-13', 'PACCAR', 'PACCAR MX-13 family'),
('VOL_D13', 'Volvo D13', 'Volvo', 'Volvo D13 / Mack MP8 family'),
('MAC_MP8', 'Mack MP8', 'Mack', 'Mack MP8 / Volvo D13 family')
on conflict (id) do update set
  common_name = excluded.common_name,
  manufacturer = excluded.manufacturer,
  notes = excluded.notes;

create table if not exists engine_normalization_map (
  id uuid primary key default uuid_generate_v4(),
  raw_string text unique not null,
  canonical_id text references canonical_engines(id),
  canonical_name text,
  manufacturer text,
  epa_standard text,
  global_alias text,
  confidence numeric default 0.85,
  notes text,
  created_at timestamptz default now()
);

insert into engine_normalization_map (raw_string, canonical_id, canonical_name, manufacturer, epa_standard, global_alias, confidence, notes) values
('X15 Efficiency', 'CUM_X15', 'X15', 'Cummins', 'EPA17', null, 0.95, 'Cummins X15 Efficiency'),
('X15 Performance', 'CUM_X15', 'X15', 'Cummins', 'EPA17', null, 0.95, 'Cummins X15 Performance'),
('X15', 'CUM_X15', 'X15', 'Cummins', 'AUTO', null, 0.90, 'Generic X15'),
('ISX15', 'CUM_X15', 'X15', 'Cummins', 'EPA13', null, 0.90, 'ISX15 maps to X15 family'),
('ISX15 CM2350', 'CUM_X15', 'X15', 'Cummins', 'EPA13', null, 0.92, 'ISX15 CM2350'),
('DD13', 'DET_DD13', 'DD13', 'Detroit', 'AUTO', 'OM471', 0.90, 'Generic DD13'),
('DD13 CPC', 'DET_DD13', 'DD13', 'Detroit', 'AUTO', 'OM471', 0.85, 'Scanner module string'),
('OM471', 'DET_DD13', 'DD13', 'Detroit', 'EuroVI', 'DD13', 0.88, 'Global DD13 equivalent'),
('DD15', 'DET_DD15', 'DD15', 'Detroit', 'AUTO', 'OM472', 0.90, 'Generic DD15'),
('DD15 Gen5', 'DET_DD15', 'DD15', 'Detroit', 'EPA21', 'OM472', 0.95, 'Detroit DD15 Gen5'),
('DD15TC', 'DET_DD15', 'DD15', 'Detroit', 'EPA10', null, 0.88, 'Older DD15TC'),
('OM472', 'DET_DD15', 'DD15', 'Detroit', 'EuroVI', 'DD15', 0.88, 'Global DD15 equivalent'),
('MX13 EPA21', 'PAC_MX13', 'MX13', 'PACCAR', 'EPA21', null, 0.95, 'PACCAR MX13 EPA21'),
('MX-13', 'PAC_MX13', 'MX13', 'PACCAR', 'EPA17', null, 0.92, 'PACCAR MX-13'),
('MX13', 'PAC_MX13', 'MX13', 'PACCAR', 'AUTO', null, 0.90, 'Generic MX13'),
('PACCAR MX13', 'PAC_MX13', 'MX13', 'PACCAR', 'EPA13', null, 0.90, 'PACCAR MX13'),
('PACCAR MX-13', 'PAC_MX13', 'MX13', 'PACCAR', 'AUTO', null, 0.90, 'PACCAR MX-13'),
('D13', 'VOL_D13', 'D13', 'Volvo', 'AUTO', 'MP8', 0.88, 'Volvo D13'),
('Volvo D13', 'VOL_D13', 'D13', 'Volvo', 'AUTO', 'MP8', 0.92, 'Volvo D13'),
('MP8', 'MAC_MP8', 'MP8', 'Mack', 'AUTO', 'D13', 0.88, 'Mack MP8'),
('Mack MP8', 'MAC_MP8', 'MP8', 'Mack', 'AUTO', 'D13', 0.92, 'Mack MP8')
on conflict (raw_string) do update set
  canonical_id = excluded.canonical_id,
  canonical_name = excluded.canonical_name,
  manufacturer = excluded.manufacturer,
  epa_standard = excluded.epa_standard,
  global_alias = excluded.global_alias,
  confidence = excluded.confidence,
  notes = excluded.notes;

create table if not exists unmapped_engines (
  raw_string text primary key,
  occurrence_count int default 1,
  last_seen timestamptz default now(),
  notes text
);

create or replace function log_unmapped_engine(engine_str text)
returns void
language plpgsql
as $$
begin
  if engine_str is null or trim(engine_str) = '' then
    return;
  end if;

  insert into unmapped_engines (raw_string, occurrence_count, last_seen)
  values (engine_str, 1, now())
  on conflict (raw_string)
  do update set
    occurrence_count = unmapped_engines.occurrence_count + 1,
    last_seen = now();
end;
$$;

create table if not exists big_4_parts (
  id uuid primary key default uuid_generate_v4(),
  oem_number text unique,
  brand text,
  engine_family text,
  part_type text,
  description text,
  created_at timestamptz default now()
);

alter table big_4_parts
add column if not exists aftermarket_part_number text,
add column if not exists engine_canonical_id text,
add column if not exists epa_standard text,
add column if not exists vin_prefix text,
add column if not exists confidence numeric default 0.75,
add column if not exists cross_references text[],
add column if not exists notes text;

create index if not exists idx_big4_oem_number on big_4_parts (oem_number);
create index if not exists idx_big4_engine_type on big_4_parts (engine_family, part_type);
create index if not exists idx_big4_canonical_epa on big_4_parts (engine_canonical_id, epa_standard);
create index if not exists idx_big4_vin_prefix on big_4_parts (vin_prefix);

insert into big_4_parts (oem_number, aftermarket_part_number, brand, engine_family, engine_canonical_id, epa_standard, part_type, description, confidence, cross_references, notes) values
('LF14000NN', null, 'Cummins', 'X15', 'CUM_X15', 'AUTO', 'Oil Filter', 'Lube filter high efficiency', 0.90, array['Fleetguard LF14000NN'], 'Verify by ESN/CPL'),
('FS1098', null, 'Cummins', 'X15', 'CUM_X15', 'AUTO', 'Fuel Water Separator', 'Fuel water separator', 0.85, array['Fleetguard FS1098'], 'Verify by ESN/CPL'),
('4386576', null, 'Cummins', 'X15', 'CUM_X15', 'AUTO', 'Water Pump', 'Engine cooling water pump', 0.80, null, 'Verify by ESN/CPL and build date'),
('4034315RX', null, 'Cummins', 'X15', 'CUM_X15', 'AUTO', 'Turbo Actuator', 'VGT turbocharger actuator', 0.75, null, 'Verify turbo family by ESN'),
('A4721800109', null, 'Detroit', 'DD15', 'DET_DD15', 'AUTO', 'Oil Filter', 'Oil filter element', 0.80, null, 'Verify by VIN/ESN'),
('A4720901651', null, 'Detroit', 'DD15', 'DET_DD15', 'AUTO', 'Fuel Filter', 'Fuel filter kit', 0.75, null, 'Verify by VIN/ESN'),
('A4722001601', null, 'Detroit', 'DD15', 'DET_DD15', 'AUTO', 'Water Pump', 'Coolant pump assembly', 0.75, null, 'Verify by VIN/ESN'),
('A0034304406', null, 'Detroit', 'DD15', 'DET_DD15', 'AUTO', 'Turbo Actuator', 'Electronic turbo actuator', 0.70, null, 'Verify by turbo and VIN'),
('1922496PE', null, 'PACCAR', 'MX13', 'PAC_MX13', 'AUTO', 'Oil Filter', 'Lube oil filter element', 0.75, null, 'Verify by VIN/engine serial'),
('1948921PE', null, 'PACCAR', 'MX13', 'PAC_MX13', 'AUTO', 'Fuel Filter', 'Fuel filter module', 0.70, null, 'Verify by VIN/engine serial'),
('2267065PE', null, 'PACCAR', 'MX13', 'PAC_MX13', 'AUTO', 'Water Pump', 'Engine water pump', 0.75, null, 'Verify by VIN/engine serial'),
('2110512PE', null, 'PACCAR', 'MX13', 'PAC_MX13', 'AUTO', 'Turbo Actuator', 'E-actuator assembly', 0.70, null, 'Verify by VIN/engine serial'),
('21707133', null, 'Volvo', 'D13', 'VOL_D13', 'AUTO', 'Oil Filter', 'Full flow lube filter', 0.75, null, 'Verify by VIN/engine serial'),
('20976003', null, 'Volvo', 'D13', 'VOL_D13', 'AUTO', 'Fuel Filter', 'Primary fuel filter', 0.70, null, 'Verify by VIN/engine serial'),
('20995158', null, 'Volvo', 'D13', 'VOL_D13', 'AUTO', 'Water Pump', 'Coolant pump', 0.70, null, 'Verify by VIN/engine serial'),
('21453331', null, 'Volvo', 'D13', 'VOL_D13', 'AUTO', 'Turbo Actuator', 'VGT control valve', 0.70, null, 'Verify by VIN/engine serial')
on conflict (oem_number) do update set
  aftermarket_part_number = excluded.aftermarket_part_number,
  brand = excluded.brand,
  engine_family = excluded.engine_family,
  engine_canonical_id = excluded.engine_canonical_id,
  epa_standard = excluded.epa_standard,
  part_type = excluded.part_type,
  description = excluded.description,
  confidence = excluded.confidence,
  cross_references = excluded.cross_references,
  notes = excluded.notes;

create or replace function smart_part_number_lookup(
  part_query text,
  raw_engine_text text default null,
  vin_text text default null
)
returns json
language plpgsql
as $$
declare
  v_norm record;
  v_fuzzy record;
  v_parts json;
  v_any_parts json;
  v_engine_short text;
  v_warning text := null;
  v_confidence text := 'UNKNOWN';
begin
  if raw_engine_text is not null and trim(raw_engine_text) <> '' then
    select * into v_norm
    from engine_normalization_map e
    where lower(e.raw_string) = lower(raw_engine_text)
    limit 1;
  end if;

  if v_norm is null and raw_engine_text is not null and trim(raw_engine_text) <> '' then
    perform log_unmapped_engine(raw_engine_text);
    v_engine_short := split_part(raw_engine_text, ' ', 1);

    select * into v_fuzzy
    from engine_normalization_map e
    where lower(e.raw_string) ilike lower(v_engine_short || '%')
       or lower(e.canonical_name) ilike lower(v_engine_short || '%')
    order by e.confidence desc
    limit 1;

    if v_fuzzy is not null then
      v_norm := v_fuzzy;
      v_warning := 'Approximate engine match used. Verify by VIN/ESN/CPL before ordering.';
      v_confidence := 'LIKELY';
    else
      v_warning := 'Engine not recognized. Logged for review. Showing broad part matches if available.';
      v_confidence := 'LOW';
    end if;
  end if;

  if v_norm is not null and v_confidence = 'UNKNOWN' then
    v_confidence := 'GOOD';
  end if;

  if v_norm is not null then
    select coalesce(json_agg(x), '[]'::json) into v_parts
    from (
      select *
      from big_4_parts p
      where (p.engine_canonical_id = v_norm.canonical_id or lower(p.engine_family) = lower(v_norm.canonical_name))
        and (p.epa_standard = v_norm.epa_standard or p.epa_standard = 'AUTO' or v_norm.epa_standard = 'AUTO')
        and (
          p.oem_number ilike '%' || part_query || '%'
          or p.aftermarket_part_number ilike '%' || part_query || '%'
          or p.part_type ilike '%' || part_query || '%'
          or p.description ilike '%' || part_query || '%'
          or p.brand ilike '%' || part_query || '%'
        )
      order by p.confidence desc
      limit 12
    ) x;
  else
    v_parts := '[]'::json;
  end if;

  if coalesce(json_array_length(v_parts), 0) = 0 then
    select coalesce(json_agg(y), '[]'::json) into v_any_parts
    from (
      select *
      from big_4_parts p
      where p.oem_number ilike '%' || part_query || '%'
         or p.aftermarket_part_number ilike '%' || part_query || '%'
         or p.part_type ilike '%' || part_query || '%'
         or p.description ilike '%' || part_query || '%'
         or p.brand ilike '%' || part_query || '%'
      order by p.confidence desc
      limit 12
    ) y;

    v_parts := v_any_parts;

    if coalesce(json_array_length(v_parts), 0) > 0 and v_warning is null then
      v_warning := 'No exact engine-specific match. Showing broad Big 4 parts matches. Verify by VIN/ESN/CPL.';
      v_confidence := 'LIKELY';
    end if;
  end if;

  if coalesce(json_array_length(v_parts), 0) = 0 then
    v_warning := coalesce(v_warning, 'No local part number found yet. Need VIN, ESN/CPL, engine family, EPA year, or OEM catalog lookup.');
    v_confidence := 'NEEDS VERIFICATION';
  end if;

  return json_build_object(
    'status', 'ok',
    'part_request', part_query,
    'vin', vin_text,
    'raw_engine', raw_engine_text,
    'normalized_engine', case when v_norm is null then null else json_build_object(
      'canonical_id', v_norm.canonical_id,
      'canonical_name', v_norm.canonical_name,
      'manufacturer', v_norm.manufacturer,
      'epa_standard', v_norm.epa_standard,
      'confidence', v_norm.confidence
    ) end,
    'confidence', v_confidence,
    'warning', v_warning,
    'parts', v_parts,
    'tech_answer', json_build_object(
      'rule', 'Never stop at nothing found.',
      'verify', 'Verify final part number by VIN / ESN / CPL before ordering.',
      'next_needed', case when coalesce(json_array_length(v_parts), 0) = 0 then 'Need VIN, ESN, CPL, EPA year, or dealer catalog lookup.' else 'Review matches, confirm fitment, then add to quote/invoice.' end
    )
  );
end;
$$;

-- Tests
select smart_part_number_lookup('water pump', 'X15 Efficiency', null);
select smart_part_number_lookup('oil filter', 'MX-13', null);
select smart_part_number_lookup('turbo actuator', 'DD15 Gen5', null);
