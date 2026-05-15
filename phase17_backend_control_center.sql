-- Rolling Cecil Phase 17 Backend Add-On
-- Employee payroll, OCR extraction, VIN extraction, admin/export support, RAG fallback.

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  employee_id text unique,
  full_name text not null,
  role text,
  hourly_rate numeric default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists employee_time_clock (
  id uuid primary key default gen_random_uuid(),
  employee_id text,
  employee_name text,
  vin text,
  job_id uuid,
  clock_in timestamptz,
  clock_out timestamptz,
  pause_start timestamptz,
  total_pause_minutes numeric default 0,
  billable_hours numeric default 0,
  hourly_rate numeric default 0,
  status text default 'clocked_out',
  notes text,
  created_at timestamptz default now()
);

create table if not exists payroll_periods (
  id uuid primary key default gen_random_uuid(),
  period_start date,
  period_end date,
  status text default 'open',
  notes text,
  created_at timestamptz default now()
);

insert into employees (employee_id, full_name, role, hourly_rate)
values
('JAMES','James','Owner / Technician',0),
('DAVID','David','Mobile Repair Specialist',0),
('STEPH','Stephani','Operations Manager',0)
on conflict (employee_id) do nothing;

create table if not exists part_scan_sessions (
  id uuid primary key default gen_random_uuid(),
  vin text,
  scan_type text,
  raw_text text,
  cleaned_text text,
  image_note text,
  created_at timestamptz default now()
);

create table if not exists scanned_part_numbers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references part_scan_sessions(id) on delete cascade,
  part_number text,
  confidence numeric default 0.75,
  status text default 'found',
  supplier text,
  price numeric,
  qty numeric default 1,
  notes text,
  created_at timestamptz default now()
);

create table if not exists invoice_parts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid,
  vin text,
  part_number text,
  part_name text,
  supplier text,
  qty numeric default 1,
  unit_price numeric default 0,
  notes text,
  created_at timestamptz default now()
);

create or replace function extract_part_numbers_from_text(
  input_text text,
  vin_text text default null,
  scan_type_text text default 'parts_photo'
)
returns json
language plpgsql
as $$
declare
  v_session_id uuid;
  v_clean text;
  v_matches text[];
begin
  v_clean := upper(coalesce(input_text, ''));

  insert into part_scan_sessions (vin, scan_type, raw_text, cleaned_text)
  values (vin_text, scan_type_text, input_text, v_clean)
  returning id into v_session_id;

  select array_agg(distinct m[1])
  into v_matches
  from regexp_matches(v_clean, '\m[A-Z0-9][A-Z0-9\-\.\/]{3,24}\M', 'g') as m
  where m[1] ~ '[0-9]'
    and m[1] not in ('PART','NUMBER','MODEL','SERIAL','FILTER','ENGINE','DIESEL','WARNING','CAUTION','MADE','DATE','CODE','TYPE','QTY');

  insert into scanned_part_numbers (session_id, part_number, confidence, status)
  select v_session_id, x, 0.75, 'found'
  from unnest(coalesce(v_matches, array[]::text[])) as x;

  return json_build_object('status','ok','session_id',v_session_id,'vin',vin_text,'scan_type',scan_type_text,'part_numbers',coalesce(v_matches,array[]::text[]));
end;
$$;

create table if not exists vin_scan_queue (
  id uuid primary key default gen_random_uuid(),
  raw_text text,
  extracted_vin text,
  status text default 'found',
  confidence numeric default 0.85,
  created_at timestamptz default now()
);

create or replace function extract_vin_from_text(input_text text)
returns json
language plpgsql
as $$
declare
  v_clean text;
  v_vin text;
  v_id uuid;
begin
  v_clean := upper(coalesce(input_text, ''));
  select m[1] into v_vin
  from regexp_matches(v_clean, '\m[A-HJ-NPR-Z0-9]{17}\M', 'g') as m
  limit 1;

  insert into vin_scan_queue (raw_text, extracted_vin, status, confidence)
  values (input_text, v_vin, case when v_vin is null then 'no_vin_found' else 'found' end, case when v_vin is null then 0 else 0.85 end)
  returning id into v_id;

  return json_build_object('status',case when v_vin is null then 'no_vin_found' else 'ok' end,'scan_id',v_id,'vin',v_vin);
end;
$$;

create or replace function rolling_cecil_hybrid_rag_search(search_text text, vin_text text default null)
returns json
language plpgsql
as $$
declare
  v_manual json := '[]'::json;
  v_memory json := '[]'::json;
begin
  begin
    select coalesce(json_agg(x),'[]'::json) into v_manual
    from (
      select * from manual_knowledge_base m
      where m.content ilike '%'||search_text||'%'
         or m.title ilike '%'||search_text||'%'
         or m.symptom ilike '%'||search_text||'%'
         or m.fault_code ilike '%'||search_text||'%'
      limit 8
    ) x;
  exception when undefined_table then
    v_manual := '[]'::json;
  end;

  begin
    select coalesce(json_agg(y),'[]'::json) into v_memory
    from (
      select * from repair_memory r
      where r.symptom_text ilike '%'||search_text||'%'
         or r.repair_action ilike '%'||search_text||'%'
         or r.fault_code ilike '%'||search_text||'%'
      limit 8
    ) y;
  exception when undefined_table then
    v_memory := '[]'::json;
  end;

  return json_build_object('status','ok','search',search_text,'vin',vin_text,'knowledge',v_manual,'repair_memory',v_memory,'route_plan',json_build_object('route','SQL fallback RAG'));
end;
$$;
