-- Apply to the confirmed Axiom Studio project only. No browser access to PII.
begin;
create table public.contact_inquiries (
  inquiry_id text primary key,
  request_key text not null unique,
  client_name text not null,
  email text not null,
  company text not null default '',
  service text not null,
  budget text not null,
  message text not null,
  phone text not null default '',
  source text not null,
  received_at timestamptz not null default now()
);
create table public.inquiry_outbox (
  id uuid primary key default gen_random_uuid(),
  inquiry_id text not null references public.contact_inquiries(inquiry_id) on delete cascade,
  channel text not null check (channel in ('email','webhook')),
  state text not null default 'pending' check (state in ('pending','processing','sent','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  lease_token uuid,
  unique(inquiry_id, channel)
);
create index inquiry_outbox_pending on public.inquiry_outbox (available_at) where state in ('pending','processing');
alter table public.contact_inquiries enable row level security;
alter table public.inquiry_outbox enable row level security;
revoke all on public.contact_inquiries, public.inquiry_outbox from anon, authenticated;
grant select, insert, update, delete on public.contact_inquiries, public.inquiry_outbox to service_role;

-- A transaction commits both the inquiry and its notifications or neither.
create function public.enqueue_inquiry(p_record jsonb, p_channels text[])
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare saved public.contact_inquiries;
begin
  insert into public.contact_inquiries(inquiry_id,request_key,client_name,email,company,service,budget,message,phone,source)
  values(p_record->>'inquiry_id',p_record->>'request_key',p_record->>'client_name',p_record->>'email',p_record->>'company',p_record->>'service',p_record->>'budget',p_record->>'message',p_record->>'phone',p_record->>'source')
  on conflict(request_key) do nothing;
  select * into saved from public.contact_inquiries where request_key=p_record->>'request_key';
  insert into public.inquiry_outbox(inquiry_id,channel)
  select saved.inquiry_id, unnest(p_channels) on conflict do nothing;
  return jsonb_build_object('id',saved.inquiry_id,'receivedAt',saved.received_at);
end $$;

create function public.claim_inquiry_jobs() returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare jobs jsonb;
begin
  -- A crashed final attempt must not stay in processing forever.
  update public.inquiry_outbox set state='failed' where attempts>=5 and state='processing' and available_at<now();
  with picked as (
    select id from public.inquiry_outbox where state in ('pending','processing') and available_at<=now() and attempts<5
    order by available_at for update skip locked limit 10
  ), claimed as (
    update public.inquiry_outbox j set state='processing', attempts=attempts+1,
      available_at=now()+interval '5 minutes',lease_token=gen_random_uuid()
    from picked where j.id=picked.id returning j.*
  ) select coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object('inquiry',to_jsonb(i))),'[]'::jsonb)
    into jobs from claimed c join public.contact_inquiries i using(inquiry_id);
  return jobs;
end $$;

create function public.finish_inquiry_job(p_id uuid,p_token uuid,p_success boolean)
returns void language sql security definer set search_path = public, pg_temp as $$
  update public.inquiry_outbox set state=case when p_success then 'sent' when attempts>=5 then 'failed' else 'pending' end,
    available_at=now()+make_interval(secs => least(3600,60*power(2,attempts)::integer)),lease_token=null
  where id=p_id and lease_token=p_token and state='processing';
$$;
revoke all on function public.enqueue_inquiry(jsonb,text[]), public.claim_inquiry_jobs(), public.finish_inquiry_job(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.enqueue_inquiry(jsonb,text[]), public.claim_inquiry_jobs(), public.finish_inquiry_job(uuid,uuid,boolean) to service_role;
commit;
