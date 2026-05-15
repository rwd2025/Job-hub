-- =========================================================
-- ROLLING CECIL AI PHASE 19
-- Parts Tech Answer Mode backend cleanup
-- Exact component keywords + X15 water pump correction
-- =========================================================

alter table big_4_parts
add column if not exists search_keywords text[];

insert into big_4_parts (
  oem_number,
  aftermarket_part_number,
  brand,
  engine_family,
  engine_canonical_id,
  epa_standard,
  part_type,
  description,
  confidence,
  search_keywords,
  notes
)
values (
  '3692580',
  '3692580RX',
  'Cummins',
  'X15',
  'CUM_X15',
  'AUTO',
  'Water Pump',
  'Cummins X15 water pump. Standard fitment seen across multiple X15/ISX15 configurations including CM2350 and CM2450. Verify by ESN/CPL before ordering.',
  0.98,
  array['water pump','coolant pump','engine water pump','x15 water pump','isx15 water pump','cummins x15 water pump'],
  '3692580RX is reman option when applicable. Verify by ESN/CPL.'
)
on conflict (oem_number) do update set
  aftermarket_part_number = excluded.aftermarket_part_number,
  brand = excluded.brand,
  engine_family = excluded.engine_family,
  engine_canonical_id = excluded.engine_canonical_id,
  epa_standard = excluded.epa_standard,
  part_type = excluded.part_type,
  description = excluded.description,
  confidence = excluded.confidence,
  search_keywords = excluded.search_keywords,
  notes = excluded.notes;

update big_4_parts
set confidence = least(coalesce(confidence,0.75), 0.70)
where engine_canonical_id = 'CUM_X15'
  and coalesce(part_type,'') ilike '%fuel%'
  and coalesce(description,'') ilike '%module%';

-- Optional cleaner function that prioritizes keyword intent.
create or replace function smart_part_number_lookup_v2(
  part_query text,
  raw_engine_text text default null,
  vin_text text default null
)
returns json
language plpgsql
as $$
declare
  v_norm record;
  v_parts json;
  v_warning text;
begin
  if raw_engine_text is not null and trim(raw_engine_text) <> '' then
    select * into v_norm
    from engine_normalization_map e
    where lower(e.raw_string) = lower(raw_engine_text)
       or lower(e.canonical_name) = lower(raw_engine_text)
    order by e.confidence desc
    limit 1;
  end if;

  if v_norm is null and raw_engine_text is not null and trim(raw_engine_text) <> '' then
    perform log_unmapped_engine(raw_engine_text);
    select * into v_norm
    from engine_normalization_map e
    where lower(e.raw_string) ilike lower(split_part(raw_engine_text,' ',1) || '%')
       or lower(e.canonical_name) ilike lower(split_part(raw_engine_text,' ',1) || '%')
    order by e.confidence desc
    limit 1;
    v_warning := 'Approximate engine match used. Verify by VIN/ESN/CPL.';
  end if;

  select coalesce(json_agg(x), '[]'::json)
  into v_parts
  from (
    select p.*,
      (
        coalesce(p.confidence,0.75) * 100
        + case when lower(coalesce(p.part_type,'')) = lower(part_query) then 500 else 0 end
        + case when lower(coalesce(p.part_type,'')) ilike lower('%' || part_query || '%') then 350 else 0 end
        + case when exists (select 1 from unnest(coalesce(p.search_keywords,array[]::text[])) kw where lower(kw) = lower(part_query)) then 600 else 0 end
        + case when exists (select 1 from unnest(coalesce(p.search_keywords,array[]::text[])) kw where lower(kw) ilike lower('%' || part_query || '%')) then 300 else 0 end
        + case when lower(coalesce(p.description,'')) ilike lower('%' || part_query || '%') then 100 else 0 end
        - case when lower(part_query) like '%water pump%' and lower(coalesce(p.part_type,'') || ' ' || coalesce(p.description,'')) ~ '(fuel|filter|separator|module)' then 1000 else 0 end
      ) as match_score
    from big_4_parts p
    where
      (v_norm is null or p.engine_canonical_id = v_norm.canonical_id or lower(p.engine_family) = lower(v_norm.canonical_name))
      and (
        p.oem_number ilike '%' || part_query || '%'
        or p.aftermarket_part_number ilike '%' || part_query || '%'
        or p.part_type ilike '%' || part_query || '%'
        or p.description ilike '%' || part_query || '%'
        or exists (select 1 from unnest(coalesce(p.search_keywords,array[]::text[])) kw where lower(kw) ilike lower('%' || part_query || '%'))
      )
    order by match_score desc
    limit 12
  ) x
  where x.match_score > 0;

  return json_build_object(
    'status','ok',
    'part_request',part_query,
    'vin',vin_text,
    'raw_engine',raw_engine_text,
    'normalized_engine', case when v_norm is null then null else json_build_object('canonical_id',v_norm.canonical_id,'canonical_name',v_norm.canonical_name,'manufacturer',v_norm.manufacturer,'epa_standard',v_norm.epa_standard,'confidence',v_norm.confidence) end,
    'confidence', case when json_array_length(v_parts) > 0 then 'HIGH' else 'NEEDS VERIFICATION' end,
    'warning', coalesce(v_warning,'Verify final part number by VIN / ESN / CPL before ordering.'),
    'parts', v_parts
  );
end;
$$;

select smart_part_number_lookup_v2('water pump','X15',null);
